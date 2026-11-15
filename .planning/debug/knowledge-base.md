# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## phone-record-cancel-focus — Cancel on a band-opened record pen returns focus to the log's button, or to body on a missing-batch address
- **Date:** 2026-11-15
- **Error patterns:** focus return, Cancel, Escape, record pen, new record, band, Record another, Record batch, wrong opener, log button, activeElement body, focus lost, 393, below 724, phone, missing batch address, no-such-batch, two openers one pen
- **Root cause(s):** The new-record pen kept no record of which control opened it. The band's record act (VersionRow, below 724) and the log's Record another / Record batch (BatchRow) call the same handleStartRecording; the only focus return for that pen, BatchRow's, always focused the log's own recordButtonRef, and VersionRow had none. A band-opened pen returned to the log's button; on an address naming no batch of the version the log draws no record button, so focus fell to body. The amend pen had already solved this with amendOpener.
- **Fix:** useRecordDraft keeps recordOpener ('log' | 'band'), set by every openNew(opener), the same rule as amendOpener; handleStartRecording({ opener = 'log' }) passes it on; the band's record act calls onStartRecording({ opener: 'band' }) and VersionRow focuses (and scrolls to) its own button when a band-opened record pen closes; BatchRow takes focus back only when recordOpener === 'log'. Residual (opener not on the page at Cancel: restored kept draft on a missing-batch address, band-opened pen after the viewport crosses 724) left on body by Mark's decision (option A, "Leave as is").
- **Files changed:** app/src/ui/useRecordDraft.js, app/src/ui/useBatchRecording.js, app/src/ui/RecipePage.jsx, app/src/ui/VersionRow.jsx, app/src/ui/BatchRow.jsx, app/src/ui/RecipePage.recordTasting.test.jsx, app/src/ui/useRecordDraft.test.jsx
- **Why not caught:** No test gate existed for the band opener: the focus-return tests exercised only the log's own Record another / Record batch, never the band's below-724 record act, so a second caller of handleStartRecording went untested. Found by the state machine audit (2026-11-10), not by test, review or verify. When a pen gains a second opener, check that it records which one opened it (amendOpener, recordOpener).
- **Recurrence guard:** app/src/ui/RecipePage.recordTasting.test.jsx, describe "Cancel on a new record returns focus to the button that opened it" (O1-O5: band and log openers at 393 and 1366, including the missing-batch address); app/src/ui/useRecordDraft.test.jsx, "openNew(opener) records which control opened the new record; openNew() is the log's"; six hand-seeded mutants at the fix sites killed; passing in the full suite on main at b6b94396 (132 files, 4340 tests).
---

