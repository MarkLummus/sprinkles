---
phase: 02-record-the-first-batch
plan: 03
subsystem: recipe-batch-recording
tags: [react, idb, vitest, domain-modeling, form-controls, radiogroup]

# Dependency graph
requires:
  - phase: 02-record-the-first-batch
    provides: "02-01's domain/batch.js shape (createBatch, tastings: [] array, snapshot with declaredAxes as { name, low, high }) and the batches IndexedDB store at DB_VERSION 2; 02-02's readMeasured, stepChangeFor/isStruck/changedLineFor, and the store's schemaVersion 2 validateTasting shape"
provides:
  - "A tasting as its own dated event on the batch (isTastingSaveable, sortedTastings, hasTasting, addTasting) — saves with words alone, marks alone, or both, never neither"
  - "domain/axes.js: CORE_AXES (four fixed behavioural anchors), MARK_STOPS (nine halves-of-a-point stops), axesForBatch (core + the batch's own snapshot-declared axes), markKeyFor"
  - "AxisMark.jsx: the nine-stop mark control as native grouped radios, restyled with new tokens, no hand-rolled keyboard handling"
  - "recordAmendment and latestChurnDate on domain/batch.js — a dated amendment that never retakes the snapshot, and the version's latest churn date for the headnote"
  - "The 2 Aug 2026 working case (data/batch-2026-08-02.js, augustSecondBatch) seeded on an empty store through the same createBatch/addTasting functions a maker's own save uses"
  - "The margin's batch list (by churn date, undated last) and Amend control, pre-filling the pen layer from the batch, never the version"
affects: [phase-3-develop-a-recipe, phase-4-print]

# Actuals (#2632)
actuals:
  tokens: 12465
  tasks: 3
  commits: 7
  plan_head_before: 4cc20f13bfdf2cc6f554c4ad55b5e6bba6dce7eb

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Native grouped radio inputs (shared `name`, no onKeyDown/tabIndex) for a fixed-stop keyboard control, restyled with appearance: none — the project's second form-input component after the as-made cell, and the first to need arrow-key/group semantics"
    - "A domain record's mark/axis namespace is disambiguated by data shape, not a type tag: markKeyFor returns axis.key when present (core) and axis.name verbatim otherwise (declared), so a declared axis sharing a core axis's name still gets a distinct mark key"
    - "Two structurally similar but semantically distinct domain functions (addTasting vs recordAmendment) are kept as two call sites rather than one updateBatch(batch, patch) — an event is never a correction and a correction is never an event (D-06)"

key-files:
  created:
    - app/src/domain/axes.js
    - app/src/domain/axes.test.js
    - app/src/ui/AxisMark.jsx
    - app/src/data/batch-2026-08-02.js
  modified:
    - app/src/domain/batch.js
    - app/src/domain/batch.test.js
    - app/src/ui/BatchMargin.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/store/seed.js
    - app/src/store/seed.test.js
    - app/src/styles/tokens.css
    - app/src/styles/app.css

key-decisions:
  - "Tasting recording is scoped entirely to an already-saved batch (openBatch), never to the initial churn-recording session — a tasting is always a later, separate event (D-01), and the brief's worked cases never show one written before the churn is saved."
  - "handleSaveTasting reloads the batch list via repository.listBatchesForVersion(id) after the write (a real re-fetch), matching the plan's explicit 'reload the version's batch list' instruction, rather than the churn-save path's local array append."
  - "The nine-stop AxisMark control has no control to un-mark an axis once set — matching native grouped radios' own behavior. D-16 only requires that an axis MAY stay unmarked before any stop is clicked; nothing in the brief or acceptance criteria asks for a clear affordance."
  - "recordAmendment's amendedAt date is produced as new Date().toISOString().slice(0, 10) — i.e. a bare YYYY-MM-DD string — matching the shape churn.churnDate and formatRecordDate already expect, rather than a full ISO timestamp."

patterns-established:
  - "Pattern: a nine-stop (or any fixed-discrete-value) keyboard control is built as native <input type=\"radio\"> grouped by a shared name inside a <fieldset>, never a custom keydown handler — the browser's own arrow-key/Home/End/click semantics are the whole mechanism"
  - "Pattern: a record's two kinds of later-arriving change (a new dated sub-event vs. a correction to an existing field) are two distinct domain functions with two distinct UI call sites, never a single patch-shaped updater"

requirements-completed: [OBS1-01, BATCH2-02, BATCH1-01]

coverage:
  - id: D1
    description: "A tasting is its own dated section on a saved batch, saved with words alone, marks alone, or both, and never with neither; a batch with no tasting says so in words and offers to add one, and the 'as expected, nothing to note' shortcut writes exactly those words"
    requirement: "OBS1-01"
    verification:
      - kind: unit
        ref: "app/src/domain/batch.test.js#isTastingSaveable"
        status: pass
      - kind: unit
        ref: "app/src/domain/batch.test.js#sortedTastings / hasTasting"
        status: pass
      - kind: unit
        ref: "app/src/domain/batch.test.js#addTasting"
        status: pass
      - kind: other
        ref: "npm --prefix app run build && npm --prefix app test (isTastingSaveable-gated-save-control gate, dangerouslySetInnerHTML gate, no-serve-target-leak gate)"
        status: pass
    human_judgment: true
    rationale: "Coverage not determined at authoring time — verifier must classify. The task's <human-check> (open a saved batch with no tasting, confirm the not-yet-evaluated wording carries no colour/icon, click Add a tasting, confirm every field is empty including the date, type a word to enable Save tasting, use the As-expected shortcut, save with no date and confirm 'date unknown', add a second earlier-dated tasting and confirm sort order) was deferred to end-of-phase UAT at the user's explicit instruction (away from the computer this session). All automated verification was run and passes."
  - id: D2
    description: "Every tasting carries the four core axes and the version's declared axes as nine-stop keyboard groups with behavioural anchors, none pre-selected, immune to a later edit of the live version record, and no aggregate/average/overall figure is ever derived from the marks"
    verification:
      - kind: unit
        ref: "app/src/domain/axes.test.js#CORE_AXES"
        status: pass
      - kind: unit
        ref: "app/src/domain/axes.test.js#MARK_STOPS"
        status: pass
      - kind: unit
        ref: "app/src/domain/axes.test.js#axesForBatch"
        status: pass
      - kind: unit
        ref: "app/src/domain/axes.test.js#markKeyFor"
        status: pass
      - kind: other
        ref: "npm --prefix app run build && npm --prefix app test (behavioural-anchor-transcribed gate, no-keydown/tabIndex gate, no-colour/px-literal gate on AxisMark.jsx)"
        status: pass
    human_judgment: true
    rationale: "Coverage not determined at authoring time — verifier must classify. The task's <human-check> (six axes in order with anchor words, no stop pre-selected, arrow-key/Home/End keyboard navigation, visible focus outline, marking three axes and confirming the other three read 'unmarked', no average/total/score anywhere) was deferred to end-of-phase UAT at the user's explicit instruction. All automated verification was run and passes."
  - id: D3
    description: "A saved batch can be corrected with a dated amendment that never retakes its snapshot; a version's batches are listed and reachable by churn date; the version line carries the latest churn date and never a count"
    requirement: "BATCH2-02"
    verification:
      - kind: unit
        ref: "app/src/domain/batch.test.js#recordAmendment"
        status: pass
      - kind: unit
        ref: "app/src/domain/batch.test.js#latestChurnDate"
        status: pass
      - kind: other
        ref: "npm --prefix app run build && npm --prefix app test (no-batches.length-in-headnote gate)"
        status: pass
    human_judgment: true
    rationale: "Coverage not determined at authoring time — verifier must classify. The task's <human-check> (fresh seed, then Amend the come-up value and confirm the amendment date shows beside the churn date with the tasting untouched; record a second later batch and confirm the margin lists both by churn date with the version line moving to the newer one, and the older one unchanged when reopened by URL) was deferred to end-of-phase UAT at the user's explicit instruction. All automated verification was run and passes."
  - id: D4
    description: "The 2 Aug 2026 batch is seeded on an empty store through createBatch and addTasting — the same functions a maker's own save uses — reproducing the confirmed transcription (as-made amounts, struck/changed steps, measured churn values, and the single undated tasting's marks) exactly; seeding twice writes it once"
    requirement: "BATCH1-01"
    verification:
      - kind: unit
        ref: "app/src/domain/batch.test.js#augustSecondBatch (the 2 Aug 2026 working case)"
        status: pass
      - kind: unit
        ref: "app/src/store/seed.test.js#seedIfEmpty"
        status: pass
      - kind: other
        ref: "npm --prefix app run build && npm --prefix app test (createBatch-usage gate, Speed-Δ-transcription gate, no-network-API gate)"
        status: pass
    human_judgment: true
    rationale: "Coverage not determined at authoring time — verifier must classify. The task's <human-check> (clear site data, reload, confirm the churned recipe opens with the 2 Aug batch already on it exactly as the photograph reads — as-made amounts, struck step 1, steps 8/9's lines, the churn section, the undated tasting with its three marks and three 'unmarked' axes — and that reloading again still shows one batch, not two) was deferred to end-of-phase UAT at the user's explicit instruction. All automated verification was run and passes."

duration: 68min
completed: 2026-09-06
status: complete
---

# Phase 2 Plan 3: Tastings, the nine-stop mark control, amendment, and the seeded 2 Aug batch Summary

**A tasting becomes its own dated event (`isTastingSaveable`/`sortedTastings`/`hasTasting`/`addTasting`) marked on six axes through a native-radio-group `AxisMark` control (`domain/axes.js`), closed out by `recordAmendment`/`latestChurnDate` and the 2 Aug 2026 working case seeded through the same `createBatch`/`addTasting` calls a maker's own save uses.**

## Performance

- **Duration:** 68 min
- **Started:** 2026-09-06T15:52:32Z
- **Completed:** 2026-09-06T20:05:17Z
- **Tasks:** 3
- **Files modified:** 12 (4 created, 8 modified)

## Accomplishments

- A tasting is its own dated section on a saved batch: it saves with words alone, marks alone, or both, and the save gate (`isTastingSaveable`) trims Unicode whitespace before deciding words are empty, while counting a mark's own key rather than its truthiness — so a mark of `0` still counts as marked (not a legal stop today, but the gate isn't the thing that decides that).
- A batch with no tasting reads "This batch has not been tasted yet." in the same prose slot the churn section uses, with no colour, icon, or urgency — and offers `Add a tasting`; a tasting with no date reads "date unknown" and the app never supplies one.
- `sortedTastings` orders by date ascending with undated tastings last, using a stable sort so two same-day or two undated tastings keep the order they were added; `addTasting` never touches `snapshot`, `recordedAt`, or `amendedAt`.
- Six axes render per tasting — the four fixed core axes (hardness, scoopability, smoothness, sweetness) with their behavioural anchors transcribed verbatim from the earlier attempt, followed by the batch's own snapshot-declared axes (olive oil character, bitterness) — each a native nine-stop radio group (`AxisMark.jsx`) with no keydown handler, no default selection, and `4.5` stored as `4.5` rather than rounded to `4` or `5`.
- `axesForBatch` reads `declaredAxes` from `batch.snapshot` only, proven immune to a later edit of the live version record by a dedicated test; `markKeyFor` gives a declared axis its `name` verbatim so a version that declares an axis named `Hardness` never collides with the core `hardness`.
- `recordAmendment` replaces the churn fields and appends a date to `amendedAt`, leaving `recordedAt`, `tastings`, and `snapshot` untouched — a correction is never a new event and never retakes the snapshot (D-06); `latestChurnDate` drives the headnote's version line, which now carries the latest churn date and never a count.
- The margin gained a batch list (by churn date, undated last, the open one marked by weight and outline) and an `Amend` control that pre-fills the pen layer from the batch's own values, never the version's.
- The 2 Aug 2026 working case (`data/batch-2026-08-02.js`) is built by calling `createBatch` and `addTasting` with fixed ids and a fixed `recordedAt`, so the seeded record is indistinguishable from a typed one and its URL is stable across installs; `seed.js` writes it inside the existing single emptiness guard, after the version.
- [Rule 2 fix] The `beforeunload` leave-warning, previously scoped only to the churn draft, now also covers an in-progress tasting draft — the same "unsaved ink" principle (D-24) applied to the record's second kind of ink.

## Task Commits

Each task followed RED → GREEN (TDD):

1. **Task 1: A tasting in the maker's own words**
   - `34ce8bb` — test(02-03): add failing tests for the tasting save gate, ordering, and addTasting (RED)
   - `46f7c9e` — feat(02-03): a tasting saves with words alone, reads in the margin (GREEN)
2. **Task 2: The marks — four core axes, the version's declared axes, and the nine-stop keyboard group**
   - `24c9c1f` — test(02-03): add failing tests for CORE_AXES, MARK_STOPS, axesForBatch, markKeyFor (RED)
   - `16cf045` — feat(02-03): the marks — core and declared axes as nine-stop keyboard groups (GREEN)
3. **Task 3: Amend, the batch list, the latest churn date, and the 2 Aug record seeded**
   - `123055f` — test(02-03): add failing tests for recordAmendment, latestChurnDate, and the seeded 2 Aug batch (RED)
   - `9bd3158` — feat(02-03): amend, the batch list, the latest churn date, and the 2 Aug record seeded (GREEN)

**Additional commit:** `2d010c0` — fix(02-03): extend the leave-warning dirty check to an in-progress tasting (Rule 2 deviation, see below)

_No REFACTOR commit was needed for any task — each GREEN implementation was minimal and left no follow-up cleanup._

**Plan metadata:** committed with this SUMMARY (see below).

## Files Created/Modified

- `app/src/domain/axes.js` — `CORE_AXES`, `MARK_STOPS`, `axesForBatch`, `markKeyFor`
- `app/src/domain/axes.test.js` — the axis list and mark-key rule under test, including the core/declared collision case
- `app/src/ui/AxisMark.jsx` — the nine-stop mark control: native grouped radios in a fieldset, anchors at the ends, no default selection
- `app/src/data/batch-2026-08-02.js` — `augustSecondBatch`, the confirmed 2 Aug 2026 working case
- `app/src/domain/batch.js` — `isTastingSaveable`, `sortedTastings`, `hasTasting`, `addTasting`, `recordAmendment`, `latestChurnDate`
- `app/src/domain/batch.test.js` — tests for all six new functions, plus the seeded working case's shape
- `app/src/ui/BatchMargin.jsx` — tasting reading/writing sections, the not-yet-evaluated state, the As-expected shortcut, marks rendering, the batch list, the Amend control, the amendment line
- `app/src/ui/RecipePage.jsx` — tasting draft state and handlers, the amend flow (pre-fill + `recordAmendment` save path), the headnote's latest-churn-date line, the extended leave-warning dirty check
- `app/src/store/seed.js` — seeds `augustSecondBatch` after the version, inside the existing single emptiness guard
- `app/src/store/seed.test.js` — the version-and-batch seeding case and the already-seeded no-op case
- `app/src/styles/tokens.css` — `--gap-mark-stop`, `--size-mark-stop`
- `app/src/styles/app.css` — tasting section, mark control, batch list, and hint styling — all through existing or new tokens

## Decisions Made

- Tasting recording is scoped entirely to an already-saved batch, never to the initial churn-recording session — see key-decisions above.
- `handleSaveTasting` reloads the batch list via `repository.listBatchesForVersion(id)`, matching the plan's explicit instruction, rather than a local array append.
- `AxisMark` has no control to un-mark an axis once set, matching native grouped radios' own behavior; nothing in the brief or acceptance criteria requires a clear affordance.
- `recordAmendment`'s `amendedAt` date is a bare `YYYY-MM-DD` string (`new Date().toISOString().slice(0, 10)`), matching the shape `churn.churnDate` and `formatRecordDate` already expect.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Extended the leave-warning dirty check to an in-progress tasting draft**
- **Found during:** Task 1 (tasting recording)
- **Issue:** D-24 ("leaving the page with unsaved ink uses the browser's own leave warning only") was implemented in 02-02 scoped to the churn draft (`isDraftDirty(mode, draft)`). Task 1 introduces a second kind of unsaved ink — the tasting draft — which the existing `beforeunload` effect did not check at all, so a maker could lose an in-progress tasting silently on navigation or reload with no warning.
- **Fix:** Added `isTastingDraftDirty(tastingDraft)`, following the same presence-over-truthiness convention as `isDraftDirty`, and combined both checks in the single `beforeunload` effect.
- **Files modified:** `app/src/ui/RecipePage.jsx`
- **Verification:** `npm --prefix app test` (158/158) and `npm --prefix app run build` both pass; manual code review confirms the effect now re-evaluates on every `tastingDraft` change.
- **Committed in:** `2d010c0`

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Necessary to fully satisfy D-24's already-accepted principle for the record's second kind of ink; no scope creep — same convention, same file, same effect.

## Issues Encountered

None beyond the deviation above.

## Deferred Human Verification

The following `<human-check>` steps from the plan were deferred to end-of-phase UAT at the user's explicit instruction (away from the computer during this session), per `workflow.human_verify_mode: end-of-phase`. All automated verification (`npm --prefix app run build`, `npm --prefix app test`, and every grep-based acceptance gate) was run for each task and passes.

**From Task 1 (a tasting saved with words alone):**
> Open a saved batch that has no tasting: the margin says it has not been tasted yet and offers `Add a tasting`, with nothing red, nothing bold, and no icon. Click it. Every field is empty, including the date; the tasting temperature field shows no trace of the version's −11 to −12 °C serve target. With every field empty, `Save tasting` is disabled and text beside it says why. Type one word into the words field: it enables. Clear it and click `As expected, nothing to note`: the words field fills with exactly that sentence and nothing else changes. Save with no date: the tasting reads `date unknown`. Add a second tasting dated earlier: it sorts above the undated one.

**From Task 2 (the marks — six axes, nine stops):**
> Open a saved batch and add a tasting. Six axes appear in order: hardness, scoopability, smoothness, sweetness, then Olive oil character and Bitterness, each with its two anchor words at the ends and none of them adjectival. No stop is pre-selected. Tab into the hardness group: focus lands on the group, arrow right moves one half step at a time through nine stops, Home and End reach the ends, and the focus outline is visible on every one. Mark olive oil character 4.5, bitterness 5 and sweetness 4, leave the other three alone, and save. The reading state shows 4.5, 5 and 4 against their anchors, and hardness, scoopability and smoothness read `unmarked`. Nothing anywhere shows an average, a total, or a score.

**From Task 3 (amend, the batch list, and the seeded 2 Aug record):**
> Clear the browser's site data and reload `npm --prefix app run dev`. The churned recipe opens with the 2 Aug batch already on it: 383 beside 370.4, 241 beside 252.8, 45 beside 40, and 0 beside 1.2 on the struck lecithin row; step 1 struck with its label; step 8 reading `blend 60 s` and step 9 its machine-settings line; in the margin `20`, `−6`, `unknown` for overrun, `Soft, not greasy`, the oil-bottle note; and beneath it a tasting headed `date unknown` with −12 °C, 4.5, 5 and 4 marked and three axes reading `unmarked`. The version line under the recipe name reads the churn date, with no count. Reload again: still one batch, not two. Now click `Amend`, change the come-up to 22, and save: the margin states the amendment's date beside the churn date, `recorded 4 Aug 2026` is still there, and the tasting is untouched. Record a second batch dated later: the margin lists both by churn date, the version line moves to the newer one, and opening the older one by URL shows it unchanged.

These should be run together at end-of-phase UAT, alongside 02-01's and 02-02's own deferred checks (noted in their respective SUMMARY.md files).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 is complete: all three plans (02-01, 02-02, 02-03) are shipped. The full batch-recording loop — churn plus tastings, amendment, reopening by URL, and the seeded 2 Aug 2026 working case — is real and covered by 158 passing tests.
- Phase 3 (develop the next version) can cite any batch by its opaque id as a change reason, read a batch's snapshot without touching the live version, and rely on `axesForBatch`/`markKeyFor` for any future axis-editing UI.
- All deferred human-check items across 02-01, 02-02, and 02-03 should be run together at end-of-phase UAT (`/gsd-verify-work`), per `workflow.human_verify_mode: end-of-phase`.
- No blockers.

---
*Phase: 02-record-the-first-batch*
*Completed: 2026-09-06*

## Self-Check: PASSED

- All 12 key files (4 created, 8 modified) verified present on disk (`[ -f ]`).
- All 7 commits (`34ce8bb`, `46f7c9e`, `24c9c1f`, `16cf045`, `123055f`, `9bd3158`, `2d010c0`) verified present in `git log --oneline --all`.
- Re-ran every acceptance criterion and the plan-level `<verification>` block: `npm --prefix app run build` (exit 0), `npm --prefix app test` (158/158, up from the 02-02 baseline of 121), the isTastingSaveable-gated-save-control, dangerouslySetInnerHTML, behavioural-anchor-transcribed, no-keydown/tabIndex, no-colour/px-literal (AxisMark.jsx), createBatch-usage, Speed-Δ-transcription, no-network-API, and no-batches.length-in-headnote gates all pass.
- Confirmed the same `grep -r` single-file portability quirk documented in 02-01-SUMMARY.md affects the colour/px literal gate on `AxisMark.jsx` on this machine; the non-`-r` equivalent form confirms the underlying invariant (zero literals) holds.
- No stub patterns (`TODO`, `FIXME`, placeholder text, hardcoded empty values feeding UI) found in any file this plan touched.
