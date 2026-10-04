---
phase: quick-261004-ly3
plan: 01
quick_id: 261004-ly3
subsystem: ui/recipe-page
tags: [save-confirmation, batch, amendment, copy]
status: complete
commits: 4
plan_head_before: 1a58afa2d57059d45af406fa167daf9ed0192bed
plan_head_after: 04b4ebb895d6a5eb0fcbce31faa1240e3e527ecd
key-files:
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/ui/RecipePage.recordTasting.test.jsx
  moved:
    - .planning/todos/pending/2026-09-17-an-amendment-announces-its-original-recording-date.md -> .planning/todos/completed/
decisions:
  - "Mark's wording (2026-10-04) overrides the plan: amendment = `changed <D Mon YYYY>`, new record = `recorded <D Mon YYYY>`, no `against <version>` on either."
metrics:
  tests: 1598 (59 files), all passing
---

# Quick 261004-ly3: Amendment save confirmation names the amendment's date

`batchSavedStatus(record)` now branches on `record.changed`: an amendment reads `changed 17 Sep 2026`, a first save reads `recorded 4 Aug 2026`, and neither carries the version suffix.

## Sentences

- New record (`changed` null): `recorded <D Mon YYYY>` from `recordedAt`, e.g. `recorded 4 Aug 2026`.
- Amendment (`changed` set by `completeRecord`): `changed <D Mon YYYY>` from `changed`, e.g. `changed 17 Sep 2026`. Same field and formatter as the read view's Changed row.
- The plan's `against <versionLabel>` is dropped on both paths, per Mark's List answer of 2026-10-04 (the page already shows the version).
- Branch is on the field, not a date comparison, so a same-day amendment reads `changed 4 Aug 2026`.
- Both call sites (`onPageStatus(batchSavedStatus(record))`, exactly two) are unchanged; the source-text gate still passes.

## RED / GREEN

- RED (test commit 0be6d30 alone): both new cases failed; received `"recorded 4 Aug 2026 against 50 g oil · 800 g"`, expected `"changed 17 Sep 2026"` (the first-save case also failed on the dropped suffix).
- GREEN (fix 13b42cc): RecipePage.test.jsx 96/96 pass, including the amend case (17 Sep and same-day 4 Aug) and the source-text gate.

## Results

- Full suite after all commits: 59 files, 1598 tests, all passing (baseline 1597 + 1 new `it`; no test removed). `npm --prefix app run build` succeeds.
- Scope check, `git log --name-only --grep=261004-ly3 -- app/`: `app/src/ui/RecipePage.jsx`, `app/src/ui/RecipePage.test.jsx`, `app/src/ui/RecipePage.recordTasting.test.jsx` (third file is the deviation below).
- Todo closed with `gsd-tools query todo complete`: moved from `.planning/todos/pending/` to `.planning/todos/completed/` with `status: completed`, `completed: 2026-10-04`; move committed in 04b4ebb.

## Commits

- 0be6d30 test: pin the save confirmation's dates without the version suffix
- 13b42cc fix: the save confirmation names the amendment's date, without the version
- 4037d3f test: the record-a-tasting amend save reads `changed <date>`
- 04b4ebb chore: close the amendment-date todo

## Deviations from Plan

**1. [Rule 1 - Bug] Second test pinned the old wording**
- **Found during:** full-suite run after the fix.
- **Issue:** `app/src/ui/RecipePage.recordTasting.test.jsx` line 247 asserted the amend-path status `startsWith('recorded ')`. Plan only named RecipePage.test.jsx.
- **Fix:** assert `startsWith('changed ')` and no `against` (it is an amend save).
- **Commit:** 4037d3f

**2. Wording overridden by Mark** (not a defect): see Sentences. The plan's "against <version>" tests were written without it.

**3. Commits landed on `main`.** Plan said sequential on the main working tree; `.planning/config.json` has `git.branching_strategy: none`. The generic protected-branch assertion would refuse; I proceeded because the dispatch and project config both put this work on main.

## Outside app/src: places still stating the old wording (not edited)

- `.impeccable/surfaces/route-recipe-batch.md` line 70 ("on every completing save the words are "recorded 4 Aug 2026 against 50 g oil · 800 g" ... an amendment states its date the same way") and line 129 (Feedback bullet, same example). Both also describe § 6 as the source of the sentence.
- `.impeccable/critique/*` snapshots (2026-09-07 batchmargin, 2026-09-09 and 2026-09-10 recipepage, 2026-09-16 batchrow) quote the old sentence; historical, self-close on target change.
- `.planning/phases/02-record-the-first-batch/` 02-CONTEXT.md (lines 61, 128), 02-RESEARCH.md, 02-PATTERNS.md, 02-01/02-03 PLAN and SUMMARY.
- `.planning/phases/03.3.1-.../03.3.1-05-PLAN.md`, `03.5-.../03.5-LADDER-CONFORMANCE.md`, `03.5-15-SUMMARY.md`, `03.3-.../03.3-UAT.md`, `03.3-07-PLAN/SUMMARY`, `03.1-02-PLAN/SUMMARY`.
- `.planning/quick/260916-xbh-.../260916-xbh-CONTEXT.md`, `.planning/quick/261002-wn0-.../` PLAN, SUMMARY and `261002-wn0-probe.mjs` line 304 (`/^recorded .* against /` — a browser probe regex that would now fail on an amend save).
- `.planning/todos/completed/2026-09-16-page-owned-feedback-scope-and-the-save-announcement.md`.
- DESIGN.md, PRODUCT.md, `.planning/sketches/`, `product-requirements/`: no match.
- Not stale: `app/src/ui/BatchRow.jsx` line 1118 prints "recorded ... against <version>" as the read view's own provenance line; it is a different surface and was left as is.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

Commits 0be6d30, 13b42cc, 4037d3f, 04b4ebb exist; modified files and the completed todo exist.
