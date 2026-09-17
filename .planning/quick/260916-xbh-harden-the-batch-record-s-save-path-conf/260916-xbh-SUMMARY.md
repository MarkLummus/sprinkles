---
quick_id: 260916-xbh
slug: harden-the-batch-record-s-save-path-conf
status: complete
date: 2026-09-17
commits:
  - e394209
files_modified:
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.test.jsx
---

# 260916-xbh: The churn date is named required, and its refusal renders once — Summary

Critique fix 2 (P1) closed: the churn date now carries `required`/`aria-required="true"` with
a caption reading "Churn date, required", and a blocked save renders `Enter the date you
churned.` exactly once — inside the date's own label, wired by `aria-invalid`/`aria-describedby`
exactly as `MeasuredField` renders a malformed number — instead of the two silent copies the
2026-09-16 critique measured at y=1306 and y=4279.

## Scope note — Mark split this task

Mark split `260916-xbh-CONTEXT.md`'s three work items on 2026-09-17, after the context file was
written. Only work item 3 (the churn date) lands in this task. Work items 1 and 2 — the save's
confirmation surviving the route change, and focus returning to the opener/landing on the saved
record — go back to the page shell's own path:
`.planning/todos/pending/2026-09-16-page-owned-feedback-scope-and-the-save-announcement.md`
(unedited, still open, still the live path for both). Building any pen-scoped or row-scoped
stand-in for either was explicitly out of scope and not built.

## What changed

- **`app/src/ui/BatchRow.jsx`** — a new module-scope `CHURN_DATE_ERROR_ID` constant
  (`'field-error-churnDate'`), directly above `MeasuredField`'s own comment block, with a note
  that `churnDate` is not a `BATTERY_FIELDS` key and so carries its own id rather than flowing
  through `MeasuredField`. The churn date's caption became "Churn date, required"; the input
  gained `required`, `aria-required="true"`, and conditional `aria-invalid`/`aria-describedby`;
  a `.field-error` span now renders inside the label when `blockedDateMessage` is set. Ceremony
  A's `hint={blockedDateMessage}` prop was deleted, and both its own comment and the field-row
  comment above the churn date were rewritten to state the new facts. The tasted date at ~593
  was not touched — it carries neither `required` nor `aria-required`.
- **`app/src/ui/RecipePage.jsx`** — a new exported `CHURN_DATE_BLOCKED_STATUS` constant beside
  `MEASURED_INVALID_STATUS`, with a comment recording why the two are siblings and why a
  form-scoped announcement must never repeat a field-scoped sentence. `penHint`'s record/amend
  branch now resolves to `null` (was `blockedDateMessage`), so `PenFoot`'s shared ceremony
  carries no hint of it either. `handleSaveBatch`'s `dateMessage` branch now calls
  `announce(CHURN_DATE_BLOCKED_STATUS)` before returning — the block status defaults to
  `target: 'form'` and does not self-clear, matching `MEASURED_INVALID_STATUS`'s own branch
  immediately above it.
- **Tests** — `BatchRow.test.jsx`'s four stale "Churn date" caption literals (the type/class/value
  order regex, two `indexOf` ordering gates, and the amend-pen regex) were updated to "Churn
  date, required"; the two-test blocked-date describe block was replaced with four tests
  covering: the required naming before any refusal; the refusal rendering exactly once with the
  right wiring and no ceremony hint; no error wiring when the message is unset; and exactly one
  `aria-required` in the whole pen with the tasting section open (so the tasted date is provably
  not required). `RecipePage.test.jsx` gained the `CHURN_DATE_BLOCKED_STATUS` import and one new
  test pinning its exact sentence, added to the existing verbatim-sentence describe block (its
  title updated to name the new constant).

## Names chosen

- `CHURN_DATE_ERROR_ID` — `'field-error-churnDate'`, the label-scoped error id, parallel to
  `MeasuredField`'s own `field-error-${field.key}` pattern but hand-named since `churnDate` is
  not a `BATTERY_FIELDS` key.
- `CHURN_DATE_BLOCKED_STATUS` — `'Check the churn date. Your entries have been kept.'`, the
  form-scoped summary, the sibling of `MEASURED_INVALID_STATUS`.

**The rule this task encodes, for whoever reads the code later:** a form-scoped announcement
never repeats a field-scoped sentence. `.form-status` (app.css) is a visible paragraph — this
stylesheet has no visually-hidden utility anywhere — so announcing `CHURN_DATE_BLOCKED_MESSAGE`
into it would print a second visible copy of the field's own sentence at the pen foot, which is
the exact defect this task removes. `CHURN_DATE_BLOCKED_STATUS` is the summary; the field's own
sentence, `CHURN_DATE_BLOCKED_MESSAGE`, is announced nowhere.

## Accepted redundancy

The caption's visible word ("required") and `aria-required="true"`'s own announcement may both
say "required" to a screen reader. This is accepted, not an oversight, and is stated in the
code's own comment so a later pass does not trim the visible word: the visible word is for the
maker who never hears it, and the attribute is for the one who does.

## Test results

`npm --prefix app test -- BatchRow` → 1 file, **124 passed** (122 baseline − 2 replaced + 4 new).
`npm --prefix app test -- RecipePage` → 1 file, **61 passed** (60 baseline + 1).
`npm --prefix app test` → **33 files passed, 953 tests passed** — the plan's expected count,
proving `PenFoot.test.jsx` and `VersionRow.test.jsx` still pass untouched.

`git diff --name-only` against the prior commit shows exactly the four files this task names —
no CSS, no `router.jsx`, no `VersionRow.jsx`, no `PenFoot.jsx` — and a grep of the diff for
`role="status"`, `saveConfirmation`, `savedStatus`, `focusRecord`, and `navigate(` found none of
them, confirming the scope guard held.

## Flagged automation gap (plan's own note, recorded here as required)

The project has **no DOM environment** — every component test in this codebase renders through
`renderToStaticMarkup` (react-dom/server), never jsdom or testing-library, and there is no click
driver anywhere in the suite. So every claim in this task that depends on *behavior* rather than
*markup* — focus landing on the churn date when a save is blocked (the existing
`blockedDateAttempt` effect, untouched by this task), the caption's two-line wrap at the 128px
field width, the measured fields' `left` offsets staying pixel-identical before and after a
refusal, and the error's computed colour reading `--ink` with nothing animating — is asserted
only in the plan's own "Browser check" section, never in a unit test, and was not run in this
task. This task's automated verification proves the *markup*: the caption text, the `required`/
`aria-required` attributes, the single rendered `.field-error`, its `aria-invalid`/
`aria-describedby` wiring, and the absence of a ceremony hint. The browser-only claims are
deferred to end-of-phase UAT, consistent with this project's standing practice of deferring
human-verify checkpoints when Mark is away and continuing automated work in the meantime.

## The save still says nothing — and that is correct today

After this task, a successful save still leaves `[role="status"]` silent and focus on `<body>`.
This is critique Priority Issue 1, now entirely the page shell's work (the pending todo above),
and is **not a regression introduced by this task** — the split-out confirmation region and
focus landing were never built here, by Mark's own scoping decision, and this task's diff
contains no live region, no route-state payload, and no `navigate()` change of any kind.

## Deviations from Plan

None — plan executed exactly as written. No Rule 1-4 deviation was needed; the diff matches the
plan's own file list, task lettering (a–g), and verify steps exactly.

## Self-Check: PASSED

- FOUND: app/src/ui/BatchRow.jsx (CHURN_DATE_ERROR_ID, required/aria-required/aria-invalid/aria-describedby, in-label .field-error)
- FOUND: app/src/ui/RecipePage.jsx (CHURN_DATE_BLOCKED_STATUS, penHint null branch, announce call)
- FOUND: app/src/ui/BatchRow.test.jsx (four rewritten date-block tests, four updated caption literals)
- FOUND: app/src/ui/RecipePage.test.jsx (CHURN_DATE_BLOCKED_STATUS import and test)
- FOUND: commit e394209 in `git log --oneline`
- CONFIRMED: `npm --prefix app test` green at 33 files / 953 tests
