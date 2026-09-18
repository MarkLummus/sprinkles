---
quick_id: 260918-jki
slug: implement-the-revised-owning-history-con
status: complete
date: 2026-09-18
commits:
  - bcb7082
  - 6acbc71
  - 45c40c4
files_modified:
  - app/src/domain/batch.js
  - app/src/domain/batch.test.js
  - app/src/ui/RecipeHistory.jsx
  - app/src/ui/RecipeHistory.test.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.test.jsx
actuals:
  tokens: 6120
  tasks: 3
  commits: 3
plan_head_before: d5e2bb4
---

# One attempt identity and one attempt provenance, shared by History and Batches — Summary

`batchIdentity(batch)` and `tastingProvenance(batch)`, two new pure functions in
`domain/batch.js`, now name every attempt (`Batch · [churn date]`) and state its tasting
provenance (`Tasted [date]` / `Not yet tasted`) once each, called from both the
recipe-level History outline (`RecipeHistory.jsx`) and the version-level Batches register
(`BatchRow.jsx`). The History disclosure lost its count (reads the bare word `History`), a
version with no attempts reads `Not yet churned`, the History outline's own citation reads
`From batch` (matching the Version row's own label for the same fact), and absence is
stated exactly once per untasted attempt — in the shared provenance line, never twice.

## Baseline, measured

`npm --prefix app test -- --run` before any edit: **38 files, 1041 tests, all passing** —
matches the plan's own recorded baseline.

## Task 1 — one attempt identity and provenance, in the domain, wired into both panels (`bcb7082`)

RED: seven behaviour cases written first in `batch.test.js` (`batchIdentity` × 2,
`tastingProvenance` × 3, plus the existing `batchHistoryMetaFor` cases retargeted in
`BatchRow.test.jsx`); confirmed failing (`tastingProvenance is not a function` etc., 5
failures) before any implementation landed.

GREEN: `batchIdentity(batch)` and `tastingProvenance(batch)` added to `domain/batch.js`
beside `recordDateWords`, in the file's own comment style, reading only
`batch.churn.churnDate` / `batch.tasting` — no new import, still framework-free. Both call
sites wired: `RecipeHistory.jsx`'s `BatchAttempt` now builds its `label` and provenance line
from the shared functions instead of local copies; `BatchRow.jsx`'s `batchHistoryMetaFor`
returns the provenance as its first array element (HIST-07: supporting evidence follows it,
never replaces it), so `BatchHistoryPanel`'s meta line can no longer be empty — the
`metaParts.length > 0 &&` guard was dropped and `<HistoryProvenance>` now renders
unconditionally. `BatchHistoryPanel`'s three identity render branches switched from the bare
`dateWords` (`recordDateWords(batch.churn.churnDate)`) to `batchIdentity(batch)`;
`recordDateWords` itself stayed imported in `BatchRow.jsx` since four other call sites still
use it directly (the batch's own read view, the head line, the provenance `dl`).

**Deviation (Rule 1 — test bug caused directly by this task's own wiring, not pre-existing):**
`BatchHistoryPanel`'s existing register-ordering test asserted
`indexOf('2 Aug 2026') < indexOf('date unknown')` to prove the undated batch sorts last.
Because all three fixture batches in that test share `augustSecondBatch`'s own undated
tasting, every row's new provenance line now also reads `Tasted date unknown` — so the
substring `date unknown` started appearing inside the *newest* batch's own meta line,
before the undated batch's identity, breaking the ordering assertion for a reason unrelated
to what it was testing. Fixed by narrowing the assertion to the identity's own unique text,
`Batch · date unknown`, which appears nowhere else. No production code changed for this;
it is a test-precision fix required by the correct behaviour the task introduced.

**Verify:** `npm --prefix app test -- --run src/domain/batch.test.js src/ui/BatchRow.test.jsx`
→ 2 files, 191 tests, green. `grep -rn "Churned and tasted" app/src` → exit 1 (retired string
gone). `grep -rn "batchIdentity\|tastingProvenance" app/src/domain/batch.js
app/src/ui/RecipeHistory.jsx app/src/ui/BatchRow.jsx` → 7 hits (2 definitions, 5 call/import
sites) — non-empty, both call sites confirmed.

## Task 2 — the History outline's own words: the citation, the unchurned version, and absence said once (`6acbc71`)

Three label corrections in `RecipeHistory.jsx`, all named in the Contract diff:

- **HIST-06:** the version's cause line reads `From batch ·{' '}` (was `After batch ·{' '}`),
  the same two words `VersionRow.jsx` already prints for the same fact.
- **HIST-05:** the no-attempts paragraph reads `Not yet churned` (was `No batch recorded`),
  same element, same `recipe-history__empty` class.
- **HIST-04:** `tastingOutcome` stops speaking about tasting state — it now returns the
  authored outcome only (the note, or the joined defects including the declared flaw), and
  `null` in both remaining branches (no tasting at all; a tasting with neither note nor
  defects). `BatchAttempt` holds the result in a local (`outcome`) and renders the
  `recipe-history__outcome` paragraph only when it is non-null, so the shared provenance
  line (Task 1) is the sole place absence or a bare tasted-date is stated.

Test moves, per the plan's own list: the two citation assertions retargeted to `From batch`;
the untasted test renamed (`... states absence once, in the provenance line alone`) and
gained a `not.toContain('recipe-history__outcome')` assertion; the unknown-dates test's
`Tasted date unknown` assertion anchored to the `recipe-history__batch-state` provenance
class rather than a bare substring; one new assertion added to the versions-nested-batches
test proving a version with zero attempts reads `Not yet churned` (the existing fixture's
`successor` version already has none, so no new fixture was needed). The authored-outcome
tests (the tasting note at line ~119, the defects at line ~159) were not touched, and both
still pass — confirming the outcome rule was not cut too deep.

**Verify:** `npm --prefix app test -- --run src/ui/RecipeHistory.test.jsx` → 1 file, 12
tests, green. `grep -rn "After batch"`, `"No batch recorded"`, `"No tasting recorded"` →
all exit 1 (gone from `app/src`). `grep -rn "Not yet churned" app/src/ui/RecipeHistory.jsx`
→ 1 hit.

## Task 3 — the History disclosure loses its count, and the two scopes are pinned (`45c40c4`)

`VersionRow.jsx`'s `HistoryDisclosure` child became the bare word `History` — no template
literal, no number, no plural branch. The render guard moved from `versionCount > 0` to
`recipeVersions.length > 0`, and the now-orphaned `versionCount` local was deleted. The
comment above the control was rewritten off the count rationale onto the brief's own reason:
versions are the outline's primary nodes and their batches are nested evidence beneath them,
so a version-only tally would name less than the disclosure holds.

`VersionRow.test.jsx` moves: the primary disclosure test now matches the full element
(`<button type="button" class="text-control history-disclosure" aria-expanded="false"
aria-controls="version-row-history">History</button>`) so a stray count cannot slip back in;
the singular-count test became the negative case, extracting the button's own inner text and
asserting it is exactly `History`; the two tests that existed only to count a deeper tree
(tree-depth, ancestor-and-sibling) were deleted whole, with their fixtures — what they proved
about recipe-level scope is now pinned by `RecipeHistory.test.jsx`'s own forest and
cross-recipe filter tests, which read the outline itself rather than a label; the "no control
at all" test now asserts the `history-disclosure` class is absent (not a substring check on
`History (`); the lineage test's trailing count assertion now expects the bare
`>History</button>`. One new test was added to the disclosure describe block for HIST-07,
pinning that this component renders only the recipe-level outline's control with no count,
and no `Batches (` control of its own (that scope belongs to `BatchRow`, already counted by
its own suite).

**Verify:** `npm --prefix app test -- --run src/ui/VersionRow.test.jsx` → 1 file, 50 tests,
green. `grep -rn "History ("` and `grep -rn "versionCount" app/src/ui/VersionRow.jsx` → both
exit 1. Full suite: `npm --prefix app test -- --run` → **38 files, 1046 tests, all passing**
(1041 baseline − 2 retired tree-depth tests + 7 net new assertions across the three tasks).
`npm --prefix app run build` → succeeds.

## Files Created/Modified

- `app/src/domain/batch.js` — `batchIdentity`, `tastingProvenance` added.
- `app/src/domain/batch.test.js` — RED/GREEN tests for both new functions.
- `app/src/ui/RecipeHistory.jsx` — `BatchAttempt` wired to shared functions; `tastingOutcome`
  narrowed to authored content only; citation reads `From batch`; unchurned label reads
  `Not yet churned`.
- `app/src/ui/RecipeHistory.test.jsx` — citation, absence-once, and unchurned assertions
  moved/added.
- `app/src/ui/BatchRow.jsx` — `batchHistoryMetaFor` leads with the shared provenance;
  `BatchHistoryPanel` uses `batchIdentity` and renders provenance unconditionally.
- `app/src/ui/BatchRow.test.jsx` — meta-array assertions moved to the provenance-first shape;
  one ordering assertion narrowed to the identity's own unique text (deviation, see Task 1).
- `app/src/ui/VersionRow.jsx` — History disclosure loses its count; `versionCount` removed.
- `app/src/ui/VersionRow.test.jsx` — count assertions replaced with bare-word assertions; two
  tree-depth-only tests retired; one new scope-distinction test added.

## Decisions Made

None beyond what the plan's Contract diff already specified — every changed line traces to
a numbered row in the plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Narrowed a register-ordering test assertion broken by this task's own change**
- **Found during:** Task 1 (wiring `tastingProvenance` into `BatchHistoryPanel`)
- **Issue:** `BatchHistoryPanel`'s existing test asserted `indexOf('2 Aug 2026') <
  indexOf('date unknown')` to prove sort order (undated batch last). Once every batch's
  shared tasting provenance also reads `Tasted date unknown` (all three fixture batches in
  that test clone `augustSecondBatch`'s undated tasting), the substring `date unknown`
  started appearing inside an earlier batch's own meta line, breaking the assertion for a
  reason unrelated to sort order.
- **Fix:** Narrowed the assertion to the identity's own unique string, `Batch · date
  unknown`, which only the undated batch's own identity can produce.
- **Files modified:** `app/src/ui/BatchRow.test.jsx`
- **Verification:** `npm --prefix app test -- --run src/ui/BatchRow.test.jsx` green; the
  assertion still proves what it always proved (undated batch sorts last).
- **Committed in:** `bcb7082` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug, test-precision only — no production code changed).
**Impact on plan:** No scope creep; the fix is a direct, necessary consequence of the
correct behaviour Task 1 introduced (every batch in that shared fixture legitimately shares
one tasting record).

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

The owning-history contract (HIST-01 through HIST-07) is fully implemented and pinned by
tests; nothing under `app/src/styles` was touched, so no visual literal was introduced. No
blockers for whatever GSD work follows. `.impeccable/surfaces/route-recipe-version.md` and
`.impeccable/surfaces/route-recipe.md` (the confirmed authority for this change) were left
untouched by this task, as instructed.

## Known Stubs

None — every changed string is wired to real data (`batch.churn.churnDate`,
`batch.tasting`), no placeholder path.

## Threat Flags

None — no new network endpoint, auth path, file access pattern, or schema change. Per the
plan's own threat model, this is a pure presentation/wording change over data the app
already reads and renders as text (no `dangerouslySetInnerHTML` introduced or touched).

## Self-Check: PASSED

- FOUND: app/src/domain/batch.js
- FOUND: app/src/domain/batch.test.js
- FOUND: app/src/ui/RecipeHistory.jsx
- FOUND: app/src/ui/RecipeHistory.test.jsx
- FOUND: app/src/ui/BatchRow.jsx
- FOUND: app/src/ui/BatchRow.test.jsx
- FOUND: app/src/ui/VersionRow.jsx
- FOUND: app/src/ui/VersionRow.test.jsx
- FOUND: commit bcb7082 in `git log --oneline`
- FOUND: commit 6acbc71 in `git log --oneline`
- FOUND: commit 45c40c4 in `git log --oneline`
- CONFIRMED: `npm --prefix app test -- --run` green at 38 files / 1046 tests
- CONFIRMED: `npm --prefix app run build` succeeds
- CONFIRMED: zero hits for `After batch`, `Churned and tasted`, `No batch recorded`,
  `No tasting recorded`, `History (` anywhere under `app/src` (final state)
- CONFIRMED: `git diff --stat` against the plan's own starting commit touches only the eight
  `files_modified` files under `app/src` (plus two pre-existing, out-of-scope
  `.impeccable/surfaces/*.md` working-tree changes that predate and are untouched by this
  task)
