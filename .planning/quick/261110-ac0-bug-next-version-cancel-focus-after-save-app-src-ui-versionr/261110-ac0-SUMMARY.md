---
phase: quick-261110-ac0
plan: 01
quick_id: 261110-ac0
status: complete
requirements:
  - bug-next-version-cancel-focus-after-save
commits: 2
plan_head_before: 4e678dfaf834b88eebd21555a498c805125dc5b8
plan_head_after: c5373fb2a4b1d0fe00aca45a547768d7cd3f46c3
---

# Quick 261110-ac0: Cancel after an arrival returns focus to Next version

The version row's arrival landing now happens once per arrival (a ref seeded from focusVersionOnMount and spent on the effect's first run), so Cancel on Next version reaches the Develop focus-return instead of being overridden by the heading landing.

## Numbers

- Step 0 HEAD 4e678dfa; full suite 131 files, 4316 tests, all passing.
- RED (test commit c59b774e): 3 failed, 1 passed. Failure line: `AssertionError: expected <h2 ...(2)><span ...(1)></span></h2> to be <button type="button" ...(2)></button> // Object.is equality`
- GREEN (fix commit c5373fb2): `-- VersionRow` pattern runs 4 files, 140 tests passing (the pattern also matches VersionRow.record and others, so the plan's 3 files / 87 was a miscount); full suite 132 files, 4320 tests, passing on 4 consecutive runs. One earlier full run showed 1 transient failure (4319/4320) that did not reproduce in 4 reruns; the failing test name was not captured.
- app/dist/index.html mtime unchanged: 1793577246.

## Commits

- c59b774e test(261110-ac0): Cancel after an arrival returns focus to Next version, pinned before the fix
- c5373fb2 fix: the version row lands on its identity once per arrival, so Cancel returns focus to Next version

## Deviations from Plan

- Commit attribution trailer used the harness-provided "Claude Sonnet 5.5" line (the model actually running), not the differing names in the plan and dispatch message.
- Ran in a worktree (npm ci was needed). The Write tool refused the main-checkout SUMMARY path for this isolated agent, so this file sits in the worktree at the same relative path, uncommitted, for the orchestrator to copy.

## Consequence to tell Mark

Save over this version, on a page that arrived with focusVersion, sets mode back to 'reading' the same way Cancel does, so focus now goes to Next version there. That is where it already goes on a page reached without the arrival state. Before, the arrival page landed on the heading. The D-27 landing is for a saved child, and Save over this version creates none. No test or code added for it.

## BatchRow

No change. Its landing depends on focusBatchOnMount and focusBatchAttempt, with no pen state. useBatchRecording.js sets focusBatchAttempt to null when a pen opens and handleCancelRecording sets it to null again, so the value does not change on Cancel, the landing does not re-run, and the Correct and Record focus-returns stand.

## Deferred Human Verification

Not yet walked in WebKit; walk before handing to Mark. iPad, iPadOS 27 Safari, Magic Keyboard, Full Keyboard Access off, on the build served by preview --host.

1. Open a recipe version and press Next version.
2. Type a version name and press Save as new version. Expect: the page shows the new version with its heading focused.
3. Press Next version, then Cancel.
4. Press Tab. Expect: focus moves to the control after Next version in the version row (Edit where it is shown, else the next control in that row), not to a link under the heading.
5. Repeat steps 3 and 4. Expect: the same.

## Self-Check: PASSED

Both commits exist; only app/src/ui/VersionRow.jsx and app/src/ui/VersionRow.landing.test.jsx changed.
