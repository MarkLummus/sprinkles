---
status: awaiting_human_verify
trigger: "the phone record Cancel focus bug"
created: 2026-11-15T15:56:09Z
updated: 2026-11-15T16:09:34Z
goal: find_and_fix
---

## Current Focus

bug_class: Bohrbug (deterministic; reproduced every time per the audit)
known_pattern_candidate: none (no knowledge-base.md exists; MemPalace not queried)
hypothesis: H1 — the record pen has no record of which control opened it. RecipePage passes the same handleStartRecording to the band (VersionRow, below 724) and to the log (BatchRow). Only BatchRow has a record focus-return effect, and it always focuses its own recordButtonRef (log's Record another / Record batch). So a band-opened pen returns to the log's button; on a missing-batch address the log draws no record button (only "No batch of this version has that address."), recordButtonRef is null, and focus falls to body.
test: Playwright WebKit 393x852 against the pre-fix preview on :4173 — press band Record another, Cancel, read activeElement; then the same on /notebook/<recipe>/<version>/no-such-batch.
expecting: case 1 activeElement is the log's .batch-row__record (not .notebook-version__acts button); case 2 activeElement is BODY.
status_note: The reported bug (both symptoms) is fixed, verified and committed (aeb2ddbf test, 6ba766ad fix). Awaiting Mark's decision on the residual (Resolution.residual_decision): no further app edit until he answers.
next_action: On Mark's answer — A: close the session (status resolved), no code change. B: in BatchRow's record and amend focus returns, when the opener was the band and the band's act is not drawn (below724 false) or no opener was pressed (restored draft), focus the log's own record button if mounted, else the Batch heading (h2#batch with tabIndex -1); RED test first in RecipePage.recordTasting.test.jsx. C: same as B but always the Batch heading.

reasoning_checkpoint:
  hypothesis: "Cancel on a band-opened record pen lands on the wrong control because the record pen keeps no opener: the one record focus-return (BatchRow.jsx:558-567) always focuses the log's recordButtonRef, and VersionRow has no record focus-return at all; on a missing-batch address that ref is null, so focus falls to body."
  confirming_evidence:
    - "WebKit 393x852 pre-fix build: band Record another -> Cancel -> activeElement is .batch-row__record (log); on /batch/no-such-batch -> BODY."
    - "jsdom RED tests O1/O2 (focus on the log's button instead of the band's) and O3 (focus on body) fail; guards O4/O5 (log openers) pass."
    - "Code: handleStartRecording takes no opener; amendOpener exists only for the amend pen; VersionRow's band ref is attached only when standing === AWAITING_TASTING."
  falsification_test: "If, after the band's Record another records opener 'band' and VersionRow focuses its own button on close, O1-O3 still fail (or WebKit still shows the log button / body), the opener is not the cause."
  fix_rationale: "Mirrors the amend pen's existing amendOpener mechanism: record which control opened the new-record pen, and let only that control's component take focus back. Fixes the cause (missing opener) rather than adding a fallback target."
  blind_spots: "A restored kept record draft has no opener (defaults to 'log', today's behaviour); on a missing-batch address at >=724 that still leaves focus on body. A band-opened pen whose viewport crosses 724 before Cancel (iPhone rotated to landscape) loses the band button and lands nowhere. Neither is the reported flow."
  candidate_causes:
    - "code: no opener state for the record pen; BatchRow focuses its own ref unconditionally (confirmed)"
    - "environment: WebKit focus() quirk (eliminated — jsdom reproduces the same wrong target, so it is not engine-specific)"
    - "data: missing batch makes openBatch null and hides the log's buttons (contributes only to symptom 2's 'nothing' vs 'wrong button', not the cause)"
  and_gate: "no for symptom 1 (the missing opener alone produces it). Symptom 2 needs the missing opener AND an address with no log record button; fixing the opener removes it, since the band's button exists there."

## Symptoms

Source: Mark's List rows `bug-phone-record-cancel-focus-wrong-opener` (Mark answered "Fix it: Cancel returns focus to the button that opened the pen") and `run-debug-phone-record-cancel-focus`. Mark started this session with "/gsd-debug the phone record Cancel focus bug"; the five fields below are taken from those rows, not asked again.

expected: On the recipe page at 393 wide, pressing Record batch or Record another in the band and then Cancel returns focus to the band's button, the one that was pressed.
actual: Focus lands on the batch log's record button, not the band's. Also: on an address naming a batch that does not exist, the same Cancel leaves focus on nothing.
errors: none
timeline: Found in the state machine audit, 2026-11-10. Not known to have ever worked. Reproduced in Playwright WebKit on the Mac at 393x852; not yet seen on the iPhone.
reproduction: At 393 wide, open a recipe page (for example /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1), press Record batch or Record another in the band, then press Cancel. Read document.activeElement.

## Leads (unverified)

- The opener focus return in app/src/ui/BatchRow.jsx appears to know one opener, not which of the two was pressed.

## Environment notes

- Playwright core (WebKit and Chromium) is importable from /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs.
- A preview of the current build is serving on http://localhost:4173 (vite preview --host). Only one Vite process per workspace; for a changed build, build to a scratch outDir and serve that on another port rather than starting a second Vite in app/.
- Do not open a safaridriver or automation session on Mark's physical iPad or iPhone. A device check is Mark's: ask him.
- Every edit under app/ follows CLAUDE.md: test first, minimal, surgical. Buttons render through app/src/ui/Button.jsx.

## Evidence

- timestamp: 2026-11-15 (before 16:09Z; not clock-read)
  checked: app/src/ui/BatchRow.jsx:551-567, 799-807, 1332-1336
  found: One record focus-return effect. When openPen leaves 'record' it calls recordButtonRef.current?.focus(). recordButtonRef is attached only to the log's own Record another (head, needs openBatch) or Record batch (no-batch state, batches.length === 0). No opener check.
  implication: Whoever opened the record pen, Cancel sends focus to the log's button, or to nothing when neither log button is mounted.

- timestamp: 2026-11-15 (before 16:09Z; not clock-read)
  checked: app/src/ui/VersionRow.jsx:108-129, 439-449; RecipePage.jsx:446, 561
  found: The band's record act (below 724) calls the same onStartRecording for Record batch / Record another. VersionRow has a focus-return only for Record tasting (amend pen, keyed on amendOpener === 'record-a-tasting'); its ref is attached only when standing === AWAITING_TASTING. Nothing returns focus to the band for the record pen.
  implication: The band's Record batch / Record another never gets focus back.

- timestamp: 2026-11-15 (before 16:09Z; not clock-read)
  checked: app/src/ui/useRecordDraft.js:50-56, 138-143, 182-192; useBatchRecording.js:118-131
  found: amendOpener ('correct' | 'record-a-tasting') exists for the amend pen only; openNew() takes no opener and handleStartRecording takes no argument.
  implication: The amend pen already solved this exact problem (sketch 011 decision 30); the record pen never got the equivalent.

- timestamp: 2026-11-15 (before 16:09Z; not clock-read)
  checked: BatchRow.jsx:1321-1322; sheetView.js openBatchFor
  found: On an address whose batch id is not in the version's batches (batches.length > 0), openBatch is null, so the log head draws neither Correct nor Record another and the body draws "No batch of this version has that address." with no button. At 393 the band still draws its record act (standing from all the version's batches).
  implication: Second symptom is the same defect: the band opened the pen, the log has no button, focus goes to body. Returning focus to the opener fixes both.

- timestamp: 2026-11-15 (before 16:09Z; not clock-read)
  checked: Playwright WebKit 393x852, pre-fix preview :4173, scratchpad/repro.mjs
  found: (1) /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1, band "Record another" -> Cancel -> activeElement is the log's <button class="text-control batch-row__record">. (2) log "Record another" -> Cancel -> same log button (correct). (3) .../batch/no-such-batch, band "Record another" (log draws no buttons) -> Cancel -> activeElement BODY.
  implication: Both symptoms reproduce deterministically, exactly as H1 predicts. H1 confirmed.

- timestamp: 2026-11-15 (before 16:09Z; not clock-read)
  checked: new describe "Cancel on a new record returns focus to the button that opened it" in app/src/ui/RecipePage.recordTasting.test.jsx (O1-O5), pre-fix
  found: O1 and O2 fail (activeElement is the log's record button, not the band's); O3 fails (activeElement is body). O4 and O5 (log openers at 393 and 1366) pass.
  implication: RED reproduces both symptoms in jsdom too, so the cause is the app's code, not WebKit.

- timestamp: 2026-11-15T16:09:34Z
  checked: fix applied (recordOpener); O1-O5 plus useRecordDraft.test.jsx; full suite; build
  found: 40/40 in the two driving files; full suite 132 files, 4340 tests pass; `npm --prefix app run build` succeeds. Note: that build writes app/dist, which the :4173 preview serves, so :4173 now serves the fixed build too (same asset hash index-D0nnuXcr.js as the scratch build).
  implication: Fix greens the driving tests with no neighbour broken.

- timestamp: 2026-11-15T16:09:34Z
  checked: Playwright WebKit against the fixed build in scratchpad/dist-fixed served on 127.0.0.1:4175 (node static server, no Vite)
  found: 393x852: band Record another -> Cancel -> band "Record another", in viewport (top 374). Log Record another -> Cancel -> log button. Missing-batch address, band Record another -> Cancel -> band button, in viewport. Zero-batch version (mexican-chocolate-v4): band Record batch -> Cancel -> band; log Record batch -> Cancel -> log. Keyboard: focus band button, Enter, Escape on the untouched pen -> band button, on both the batch and the missing-batch address. 1024x1366 and 1366x1024: band draws no record act; log Record another -> Cancel -> log button.
  implication: Both reported symptoms are gone in the real built app; the wide layouts' opener focus is not regressed.

- timestamp: 2026-11-15T16:09:34Z
  checked: residual paths in WebKit on the fixed build (probe3.mjs, probe4.mjs)
  found: (a) A restored kept record draft (no button pressed) then Cancel: on a real batch address -> log "Record another" (unchanged from before); on a missing-batch address -> BODY at 393 and at 1366 (unchanged from before; pre-existing). (b) Band Record another at 393, viewport changed to 852x393 (phone rotated), then Cancel -> BODY: the band's record act is not drawn from 724 up, so the opener is gone. Before the fix this landed on the log's Record another. The amend pen's band Record tasting already behaves the same way (same pattern, not changed here).
  implication: Neither is the reported flow. Both are one question: where should focus go when the control that opened the pen is not on the page at Cancel? That is a design choice (decision checkpoint), not something to guess.

- timestamp: 2026-11-15T16:09:34Z
  checked: fix-acceptance guardrail
  found: Stryker not installed, so six hand-seeded mutants at the fix sites were run against the driving files; all six killed (BatchRow gate -> true; VersionRow gate -> false; band call drops opener; hook drops opener; openNew ignores opener; band ref back to Record-tasting-only). Revert-and-reconfirm via `git stash push` of the five source files: 5 tests fail; `git stash pop`: 40/40 pass.
  implication: The tests pin the cause, not only the symptom, and this change is what fixes it.

## Eliminated

- hypothesis: WebKit-specific focus() behaviour sends focus to the wrong button
  evidence: jsdom (no WebKit) reproduces the same wrong target in O1/O2 and body in O3 before the fix.
  timestamp: 2026-11-15 (before 16:09Z; not clock-read)

## Resolution

root_cause: The new-record pen kept no record of which control opened it. RecipePage hands the same handleStartRecording to the band's record act (VersionRow, below 724) and to the log's Record another / Record batch (BatchRow). The only focus return for that pen, BatchRow's, always focused the log's own button (recordButtonRef), and VersionRow had none. So a band-opened pen returned focus to the log's button, and on an address naming no batch of the version, where the log draws no record button, focus fell to the page body. The amend pen had already solved this with amendOpener; the record pen never got the equivalent.
fix: useRecordDraft keeps recordOpener ('log' | 'band'), set by every openNew(opener), the same rule as amendOpener. useBatchRecording.handleStartRecording({ opener = 'log' }) passes it on; RecipePage passes options through and hands recordOpener to VersionRow and BatchRow. The band's record act calls onStartRecording({ opener: 'band' }) and its ref (renamed recordActButtonRef) is attached for every record act word; VersionRow's band focus return (focus plus scrollIntoView, as for Record tasting) now also fires when a band-opened record pen closes. BatchRow takes focus back only when recordOpener === 'log', and its two record buttons call onStartRecording() so the click event is never read as options.
oracle_type: specified (Mark's answer on bug-phone-record-cancel-focus-wrong-opener: Cancel returns focus to the button that opened the pen)
verification:
  target_test: { result: pass, tests: "RecipePage.recordTasting.test.jsx O1-O3 (red before, green after); useRecordDraft.test.jsx openNew(opener)" }
  mutation_check: { result: pass, reason_if_skipped: "Stryker not installed; six hand-seeded mutants at the fix sites instead", mutant_killed: 6 of 6 }
  no_op_deletion: { result: pass, deletion_justified_by_rca: n/a (the diff adds state and a gate; nothing deleted) }
  adjacent_tests: { result: pass, suites_run: ["full suite: 132 files, 4340 tests"] }
  revert_and_reconfirm: { result: pass, bug_returned_on_revert: true, fixed_on_reapply: true }
  built_app: "WebKit 393x852, 1024x1366, 1366x1024 on scratchpad/dist-fixed via :4175 — see Evidence"
  guardrail_verdict: accepted
files_changed: [app/src/ui/useRecordDraft.js, app/src/ui/useBatchRecording.js, app/src/ui/RecipePage.jsx, app/src/ui/VersionRow.jsx, app/src/ui/BatchRow.jsx, app/src/ui/RecipePage.recordTasting.test.jsx, app/src/ui/useRecordDraft.test.jsx]
commits: [aeb2ddbf (test, red until the fix), 6ba766ad (fix)]
residual_decision: "Where should focus go when the control that opened the record pen is not on the page at Cancel? (a restored kept draft on a missing-batch address; a band-opened pen after the viewport crosses 724). Today both land on body."
