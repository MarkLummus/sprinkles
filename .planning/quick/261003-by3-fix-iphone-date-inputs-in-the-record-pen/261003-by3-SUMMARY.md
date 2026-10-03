---
phase: quick-261003-by3
plan: 01
quick_id: 261003-by3
subsystem: ui
tags: [ios, date-input, focus, react, webkit]
status: complete
requirements: [OBS1-01, UX1-01]
key-files:
  modified:
    - app/src/ui/BatchRow.jsx
  created:
    - app/src/ui/BatchRow.dates.test.jsx
    - .planning/quick/261003-by3-fix-iphone-date-inputs-in-the-record-pen/261003-by3-probe.mjs
decisions:
  - "Record a tasting focuses only the Tasted date: Churn date autoFocus={addTastingAttempt == null}"
  - "Strip the value attribute from both date inputs with a no-deps useLayoutEffect plus queueMicrotask in each date onChange (the microtask was needed, measured)"
actuals:
  tasks: 2
  commits: 4
plan_head_before: e837066e1c1dff157be55fe6016c3f5ed55c0239
plan_head_after: 36b92a2d8cecf9aaf4459ea85aaf9dfb98615b28
completed: 2026-10-03
---

# Quick 261003-by3: iPhone date inputs in the record pen

Record a tasting now makes one date focus (the Tasted date), and iOS Reset empties either date input because neither carries a value attribute any more.

## Both fixes as built (app/src/ui/BatchRow.jsx)

1. **One date focus on Record a tasting.** The Churn date has `autoFocus={addTastingAttempt == null}` (line 707) with a short comment above it. `addTastingAttempt` is a number only for the Record a tasting opener, so Correct and Record another keep the mount focus.
2. **No value attribute on the date inputs.**
   - `useLayoutEffect` added to the import (line 1).
   - `stripDateValueAttributes()` (lines 515-518) calls `removeAttribute('value')` on `churnDateRef` and `tastedDateRef`.
   - A no-deps `useLayoutEffect` (line 519) runs it after every commit.
   - Each date input's `onChange` keeps its `onChangeRecordField` call, then calls `queueMicrotask(stripDateValueAttributes)` (lines 712 and 838).
   - A comment above the function cites facebook/react #8938, #12313 and #23299, the debug file and 261003-by3.

## RED then GREEN evidence

**Task 1.**
- RED commit 45a0c00. F1 (Record a tasting) failed with `['Churn date', 'Tasted']`.
- F2 (Correct), F3 (Add tasting inside an open Correct pen) and F4 (Record another) are guards. They passed before the fix.
- GREEN commit ea5a95c. All four pass.

**Task 2.**
- RED commit 6bfc420. A1 to A4 failed, six tests across both inputs. F1 to F4 stayed green.
- GREEN step a, the layout effect alone: A1, A2 and A3 passed. A4 still failed, for both the Churn date and the Tasted date, at `expect(input.hasAttribute('value')).toBe(false)` straight after the pick (`AssertionError: expected true to be false`, BatchRow.dates.test.jsx:283). That is the measured reason for the complement: React rewrites the attribute after the commit, when it restores the input after that input's own onChange.
- GREEN step b added the `queueMicrotask` complement. All ten tests pass.
- The microtask line was needed. The planner's reading of react-dom was right.
- GREEN commit 36b92a2.

## Probe readings (Playwright WebKit, iPhone 14 descriptor pinned to 393x852, app/dist)

Raw output is kept in the scratchpad (by3-paths-before.txt, by3-reset-before.txt, by3-paths-after.txt, by3-reset-after.txt).

**paths, date focus captions per tap**

| Tap | before | after |
|---|---|---|
| P1 Record a tasting (band) | Churn date, Tasted | Tasted |
| P2a Correct | Churn date | Churn date |
| P2b Add tasting | Tasted | Tasted |
| P3 Record another | Churn date | Churn date |

- Every focus came inside the tap's own task.
- activeElement after the settle was the last caption's input in every case.
- `paths before` passed 8 checks, and `paths after` passed 8 checks. Both exit 0.

**reset, value and attr per step**

| Step | before (value / attr) | after (value / attr) |
|---|---|---|
| R1 Tasted, pick 2026-10-01 | 2026-10-01 / 2026-10-01 | 2026-10-01 / null |
| R1 Tasted, reset then rerender | 2026-10-01 / 2026-10-01 (immediate 2026-10-01) | '' / null (immediate '') |
| R1 Tasted, pick 2026-09-30 then rerender | 2026-09-30 / 2026-09-30 | 2026-09-30 / null |
| R1 Tasted, second reset then rerender | 2026-09-30 / 2026-09-30 | '' / null (immediate '') |
| R1 Churn, pick 2026-09-29 | 2026-09-29 / 2026-09-29 | 2026-09-29 / null |
| R1 Churn, reset then rerender | 2026-09-29 / 2026-09-29 | '' / null (immediate '') |
| R2 Churn at open (stored date) | 2026-08-02 / 2026-08-02 | 2026-08-02 / null |
| R2 Churn, reset then rerender | 2026-08-02 / 2026-08-02 | '' / null (immediate '') |

`reset before` passed 12 checks (the defect reproduced), and `reset after` passed 20 checks. Both exit 0.

## Tests, build and scope

- `npm --prefix app test`: 59 files, 1584 tests, all passing. That is 1574 plus 10 new, none removed.
- `npm --prefix app run build` succeeds. app/dist is rebuilt, so Mark's :4173 preview serves the fix.
- Scope check passed.
  - The 261003-by3 commits touch under `app/` only `BatchRow.jsx` and `BatchRow.dates.test.jsx`.
  - Nothing under `.planning/canvas-generators/` was touched.
  - `git status --porcelain -- app` is empty.
- No Vite server was started, and :4173, :5173 and :8011 were never requested.
- `commits: 4` is measured from the plan ledger (base e837066, which is Sid's docs commit that landed just before the first task commit).

## Deviations from Plan

None. The plan executed as written. The only choice not spelled out was the `A3`/`A4` loop over both inputs, which the plan's "for each date input in turn" already called for.

## Limits

The readings come from Playwright WebKit (iPhone 14 descriptor, 393, coarse) on the built app. They do not come from Mark's iPhone. The calendar tear-down itself and iOS's real Reset button happen only on the device, so the fix counts as device-verified only when Mark confirms.

## Flags for Mark

1. **Today-fill makes the pen dirty.** On the iPhone, Record a tasting now puts today's date into the empty Tasted date as soon as the pen opens, as Add tasting already does. That makes the pen dirty, so Escape no longer closes it and Cancel does.
2. **Churn date stays as stored.** Before the fix, the same tap put today into an empty Churn date (Coconut v2) instead. Record a tasting now leaves the Churn date as stored.
3. **Unchanged and not asked for.** Correct and Record another still put today into an empty Churn date when the pen opens.
4. **Microtask line.** The `queueMicrotask` line in each date `onChange` was needed (test A4 failed with the layout effect alone), so it is in.

## Device check (deferred to Mark)

Mark's :4173 preview serves the rebuilt app/dist. Hard-reload the tab on the iPhone, then on Coconut v2:

1. Tap Record a tasting in the band. The Tasted date's calendar opens and stays open, today's date appears in the Tasted date, and the Churn date stays empty. Cancel closes the pen.
2. Tap Correct. The Churn date's calendar stays open. Close it, then tap Add tasting. The Tasted date's calendar opens and stays open.
3. Tap Record another. The Churn date's calendar stays open.
4. In any of these pens, Reset in the calendar clears the date, for both the Tasted date and the Churn date. The field stays empty after typing in another field. Picking a date after a Reset works.

## Self-Check: PASSED

- Files found: BatchRow.jsx, BatchRow.dates.test.jsx, 261003-by3-probe.mjs.
- Commits found: 45a0c00, ea5a95c, 6bfc420, 36b92a2.
