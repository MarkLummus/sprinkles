---
phase: quick-261002-wn0
plan: 01
quick_id: 261002-wn0
subsystem: recipe-band
tags: [notebook, band, phone, amend-pen, sketch-011-decision-30]
status: complete
requires: [261002-wmz]
provides:
  - "RecipePage.handleStartAmending(batch, { opener }) with the 'record-a-tasting' opener: Tasting open, Tasted date focused"
  - "RecipePage.handleStartTasting(batch), replacing wmz's SEAM(261002-wn0) handleRecordTasting"
  - "amendOpener state read by BatchRow (Correct's focus return) and VersionRow (the band's focus return)"
  - "startTasting route state: the band's Record a tasting on an older batch's address moves to the awaiting batch and opens the pen there"
affects: [261002-wn1]
key-files:
  created:
    - app/src/ui/RecipePage.recordTasting.test.jsx
    - .planning/quick/261002-wn0-record-a-tasting-opens-the-amend-pen-on-add-tasting-without/261002-wn0-probe.mjs
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/BatchRow.jsx
    - app/src/ui/VersionRow.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/ui/VersionRow.record.test.jsx
decisions:
  - "The pen's head is reused: no Correct word anywhere in a band-opened pen, no invented head"
  - "Cancel and Escape (untouched) return focus to the band's Record a tasting and scroll it to the centre"
  - "Save lands on the log's Batch heading (brief section 3), not on the band"
  - "On an older batch's address the band moves to the awaiting batch's own address (route state, consumed once)"
commits: 5
plan_head_before: 0caaefa5b255d8e20aadaf7f43448cf2b993acee
plan_head_after: b403acc8b02c0ad80a3972e68ec3e08152b37f8b
metrics:
  tasks: 3
  files: 7
actuals:
  tasks: 3
  commits: 5
---

# Phase quick-261002-wn0 Plan 01: Record a tasting opens the amend pen on Add tasting Summary

Below 724, the band's Record a tasting now opens the log's amend pen with the Tasting section already open and the Tasted date focused, without going through Correct. Cancel and an untouched Escape return focus to the band; Save writes the tasting onto that batch through the existing amend save and lands on the Batch heading.

The readings below come from Playwright WebKit and system Chrome on this Mac, not from Mark's iPhone or iPad.

## Step 0 answers (what wmz landed)

- Q1: the band's control is in `app/src/ui/VersionRow.jsx` (the first child of `.notebook-version__acts` when `below724`). The seam was `RecipePage.handleRecordTasting`, marked `SEAM(261002-wn0)`, whose body was `handleStartAmending(sortedBatches(batches)[0])`.
- Q2: the band computes the version's latest batch itself (`standingFor(batches)` reads `sortedBatches(batches)[0]`). It does not read RecipePage's `openBatch`. So the batch the label names can differ from the batch in view, and Task 2's case is reachable and was built.
- Q3: wmz added no opener state. Its Cancel left focus on the log's own opener (Correct, via BatchRow's existing return). This item added `amendOpener` for that.
- Q4: the below-724 condition is a JS media hook, `useBelow724()` in `useBelowDesktop.js` (query `(max-width: 723.98px)`), read once in RecipePage and passed down as `below724`.
- Post-wmz baseline: 57 files, 1545 tests (wmz's SUMMARY; confirmed by the 58 files and 1551 tests below being +1 file and +6 tests).

## What was built

- `RecipePage.jsx`
  - `amendOpener` state, initially `'correct'`, overwritten on every amend open and never cleared. Its comment says the close effects read it as captured when the pen opened.
  - `handleStartAmending(batch, { opener = 'correct' } = {})`. For `'record-a-tasting'` the pre-filled draft is `{ ...draftFromBatch(batch), tastingOpen: true }` and the baseline is a structuredClone of that same object, so an untouched pen is clean (Escape closes it, no leave warning). It bumps `addTastingAttemptRef` and sets `addTastingAttempt` instead of resetting it to null, so BatchRow's existing effect focuses the Tasted date. Correct's one-argument call is unchanged.
  - `handleStartTasting(batch)` replaces `handleRecordTasting`. Opens in place when `batch` is the batch in view (compared by id); otherwise navigates to `notebookPath(version.recipeId, version.id, batch.id)` with `state: { startTasting: true }`.
  - One effect above the early returns, guarded by a consumed-once ref: when the flag is set, the mode is reading, the URL names a batch and the loaded batches hold it with no tasting, it replaces the entry's state with null and opens the pen. Back or a reload never reopens a pen.
- `BatchRow.jsx`: new prop `amendOpener`; the Correct focus-return sets `wasAmendingRef` to `amendOpener === 'correct'`. One line of logic.
- `VersionRow.jsx`: `onRecordTasting()` became `onStartTasting(latestBatch)`, where `latestBatch` is `sortedBatches(batches)[0]`, the batch `standingFor` read. A ref and a was-opener pair on the button, keyed on `openPen` and placed above the conditional render, give it focus back when its pen closes. No button, label, stylesheet rule or token was added.

## RED then GREEN

- RED `0a44095`: T1 to T4 failed for the stated reasons (no Tasting h3, focus on Correct, no textarea). T5 (Correct unchanged) is a guard and passed before and after.
- GREEN `da87dce`: T1 to T5 pass.
- RED `e40e99a`: T6 (older batch's address) failed on the pathname.
- GREEN `5fbe805`: T6 passes, including that re-mounting the replaced history entry opens no pen.
- Probe `b403acc`: the matrix group.

Test stubs in the new file (never app code for jsdom): `window.matchMedia` (a fixed 393 coarse window) and `Element.prototype.scrollIntoView`, which jsdom lacks. The repository seam is an in-memory stand-in over `vi.mock`.

## Settled answers (the planner's, as built)

- Heading: reused. The open pen reads "Batch" and "churned 2 Aug 2026". The word Correct is the log head's opener only, unmounted while any pen is open (T1, probe).
- Cancel and Escape (untouched) return focus to the band's Record a tasting and bring it into view.
- Save batch goes through the amend path (`completeRecord`, never a new batch), announces "recorded ... against ...", and lands focus on the log's Batch heading in place.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 - Bug] focus() alone did not bring the band back in Playwright WebKit**
- **Found during:** Task 1 tracer, WebKit 393 coarse.
- **Issue:** after Cancel the band's Record a tasting held focus but sat 2677px above the viewport (scrollY 3078). Chrome scrolled to it. A page-level `focusin` or `scroll` listener changed WebKit's result, so the behaviour is timing-sensitive in that engine; a bare `focus()` cannot be relied on for a return of this distance.
- **Fix:** the band's focus-return effect now also calls `scrollIntoView({ block: 'center' })` on the button. After it, both engines end at scrollY 0 with the band in view. T2 asserts the call (jsdom stub).
- **Files:** `app/src/ui/VersionRow.jsx`, `app/src/ui/RecipePage.recordTasting.test.jsx`. **Commit:** da87dce.
- **For Mark:** this is the first `scrollIntoView` in `app/src`. It is unproven on the iPhone itself; if the device already scrolls on `focus()` it does nothing harmful (centring a control that is already near the middle).

**2. [Rule 3 - Blocking] wmz's seam pins had to move with the seam**
- `VersionRow.record.test.jsx` Test J pinned `onRecordTasting` called with no argument; it now pins `onStartTasting` called once with the batch (`id` checked). The spies were renamed.
- `RecipePage.test.jsx` Test L pinned `handleRecordTasting` as a single call and the `SEAM(261002-wn0)` marker; it now pins `handleStartTasting` over `handleStartAmending(batch, { opener: 'record-a-tasting' })`, and the marker test now asserts the marker and the old name are gone. No test was deleted; the count is unchanged by this.
- These two files are outside the plan's `files_modified`. Plan Task 2's scope audit regex would flag them; they are the seam's own pins, changed only for the rename and the argument.

## Open questions for Mark

1. The batch item's text says Save returns the maker to the band. The brief (route-recipe-batch.md section 3) lands a save on the Batch heading in the log, and this follows the brief. Should a save started from the band's Record a tasting return to the band instead?
2. Should the pen's head name the act (a tasting) when opened from the band? Today's head is reused because no board draws another.
3. The amend pen keeps the churn fields above the tasting open and editable, and its save stamps "Changed {date}" on the batch (`completeRecord`, D-04); the save button reads "Saving changes…" while it writes. The probe shows `changed` set after a band-opened save. Brief section 3 says "Adding a tasting is not an amendment". Already true of Correct then Add tasting; not changed here.
4. Every seeded batch that awaits tasting has no churn date (Mexican Chocolate v3, Coconut v2, Strawberry v2, Mocha v2 and v3). Measured on Coconut v2 at 393 coarse in both engines: Record a tasting opens on the Tasted date; typing Tasting temperature -12 and Save batch is refused with "Enter the date you churned.", focus moves to the Churn date, and the pen stays open (D-05, unchanged). A batch the app records always has a churn date.
5. Removing the tasting inside a pen this path opened makes the draft dirty against its baseline, so Escape no longer closes it and Cancel does. Minor, unchanged in kind ("a removal is ink").
6. On an older batch's address, Record a tasting moves to the awaiting batch's own address and opens the pen there (built, T6 and probe case f). Is a URL change right here, or should the band stay on the older batch's address and refuse?

## Probe results

`261002-wn0-probe.mjs`, groups `tracer` and `matrix`: 84 checks passed, exit 0, both engines. Throwaway contexts only; no request to :4173, :5173 or :8011; no Vite process started.

| Case | WebKit | Chrome |
| --- | --- | --- |
| tracer: one Record a tasting in the band; pen opens on Tasting; Tasted date focused and in view; no Correct; head "churned 2 Aug 2026"; Cancel closes, focus on the band control in view, nothing written | pass | pass |
| (a) 393 coarse, board values: opens on Tasted date; board tasting values filled; frame vs 393-pen-app.html; Save closes the pen, focus on `h2#batch` in view, status "recorded 3 Oct 2026 against 50 g oil · 800 g", band reads Record another, stored tasting.tastedDate 2026-08-04, tastingTempC -12, churn date still 2026-08-02, `changed` stamped | pass | pass |
| (b) 393 coarse, Escape: untouched pen closes onto the band, in view; typed pen stays open | pass | pass |
| (c) 723 fine: Tasting open, Tasted date focused; Cancel focuses the band control | pass | pass |
| (d) 1366 fine: no Record a tasting button anywhere; Correct opens the pen with Add tasting and no Tasting h3; Cancel focuses Correct | pass | pass |
| (e) 393 coarse, Coconut v2: Save refused with "Enter the date you churned.", focus on Churn date, pen stays open | pass | pass |
| (f) 393 coarse, older batch address: URL becomes the new batch's address, pen opens there on the Tasted date, head "churned 9 Aug 2026", Cancel focuses the band control, reload opens no pen | pass | pass |

Cancel scroll (tracer, scrollY before the click, with the pen open, and after Cancel): WebKit 2912, 5295, 0; Chrome 2900, 5283, 0.

## Board comparison: the pen against 393-pen-app.html

Case (a), after filling the board's churn and tasting values, every descendant of `.batch-margin--pen` with a box, in DOM order, relative to the frame's top-left:

| Engine | Frame (app / board) | Elements | tag.class sequence | Largest difference | Mismatches |
| --- | --- | --- | --- | --- | --- |
| WebKit | 353 x 2578 / 353 x 2578 | 268 / 268 | equal | 0 | none |
| Chrome | 353 x 2570.67 / 353 x 2570.67 | 268 / 268 | equal | 0 | none |

Skin readings (recorded, not compared; the decision 29 App skin is not built in the app, todo 2026-09-25 pending):

| Reading | App | Board |
| --- | --- | --- |
| Picked axis stop background | rgb(31, 61, 122) | rgb(21, 118, 222) |
| Text field border radius | 0px | 8px |

Identical in both engines.

## Verification and test count

- `npm --prefix app test`: 58 files, 1551 tests, all passing. Post-wmz baseline 57 files and 1545 tests, so +1 file (`RecipePage.recordTasting.test.jsx`) and +6 tests (T1 to T6), none removed.
- `npm --prefix app run build` passes; `app/dist` was rebuilt from the final code, so Mark's :4173 preview serves it. The preview was not started, stopped or requested.
- `git status --porcelain app/src` is empty.
- Files this item touched under `app/`: `RecipePage.jsx`, `BatchRow.jsx`, `VersionRow.jsx`, the new test file, and the two wmz test files named above. No stylesheet, token, board, canvas generator, `.impeccable` file or DESIGN.md changed.

## Deferred: Mark's device check (human-check, end-of-run UAT)

Mark's :4173 preview serves the rebuilt `app/dist`. He reloads on the iPhone (a hard reload if it looks stale). On a version whose latest batch awaits tasting (Coconut v2 is seeded so, or record a batch first on Olive Oil v1 with a churn date):
1. Tap Record a tasting in the band. The log's pen opens at the Tasting section, the Tasted date is focused and in view, and Correct was never pressed. Note whether iOS pops the date wheel or the keyboard at once, and whether the keyboard covers the fields.
2. Tap Cancel. The pen closes and the band's Record a tasting is back in view (centred) and focused. This is the scroll that needed `scrollIntoView` in WebKit.
3. Open again, enter a tasting and Save batch. On Coconut v2 the app asks for the churn date first (open question 4). Focus lands on the log's Batch heading, and the band then reads Record another.
4. Look at the open pen beside 393-pen-app.html. Geometry matched to 0px here; colours and the 8px field radius differ until decision 29's App skin is built.
5. Answer open questions 1 to 6.

The change counts as device-verified only when Mark confirms.

## Known Stubs

None.

## Threat Flags

None. `startTasting` route state carries a boolean only; the batch id comes from the URL and is consumed once (T-wn0-03). The pen opens in place only on the batch in view, by id (T-wn0-01).

## Self-Check: PASSED

- FOUND: app/src/ui/RecipePage.recordTasting.test.jsx and the probe in the quick directory
- FOUND commits: 0a44095, da87dce, e40e99a, 5fbe805, b403acc
- FOUND: `record-a-tasting` in RecipePage.jsx, `amendOpener` in BatchRow.jsx, `onStartTasting` in VersionRow.jsx
