---
phase: quick-260918-a5l
plan: 01
subsystem: ui
tags: [react, jsx, css-tokens, domain-cleanup, recipe-history]

# Dependency graph
requires: []
provides:
  - "REVIEW-01/-02: penReason and batchHistoryWords orphans removed"
  - "REVIEW-03: a CSS rule for the version in view, scoped to its own sheet"
  - "REVIEW-04: recipe-history's two flex-basis literals relocated into tokens.css"
  - "REVIEW-05: versionForest promotes a cyclic parent pair to two roots instead of dropping both; the unreachable render-time guard removed"
  - "REVIEW-06: VersionNode's parent-to-children map renamed childrenByParent, unshadowing React's children"
  - "REVIEW-07: a version of another recipeId proven never to render, restoring VersionStrip.test.jsx's lost coverage"
  - "REVIEW-08: makeBatch's duplicate churn key reduced to one"
  - "The pre-existing uncommitted RecipeHistory disclosure landed on main as three atomic commits"
affects: [recipe-history, version-row, batch-row]

# Actuals (#2632)
actuals:
  tokens: 9000
  tasks: 4
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "A cyclic-ancestry check (chainTerminates) walks a version's parentVersionId chain against a seen-id Set; a version whose chain revisits an id is treated exactly like an orphan (parentless, promoted to root) instead of being rendered with a defensive visited-set guard"

key-files:
  created: []
  modified:
    - app/src/ui/VersionRow.jsx
    - app/src/ui/VersionRow.test.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/domain/batch.js
    - app/src/domain/batch.test.js
    - app/src/styles/app.css
    - app/src/styles/tokens.css
    - app/src/ui/RecipeHistory.jsx
    - app/src/ui/RecipeHistory.test.jsx

key-decisions:
  - "REVIEW-03's selector: `.recipe-history__version.is-current > .recipe-history__version-sheet` (weight 700 + the register's outline/outline-offset) — scoped to the version's own sheet, a descendant of the is-current list item, so the treatment cannot reach the branches subtree (descendant version nodes) that sits as the sheet's sibling inside the same list item."
  - "REVIEW-04's tokens: `--rhist-vname-min: 22rem` and `--rhist-bname-min: 16rem` in tokens.css, each holding its rule's previous literal value unchanged — a relocation, not a retune."
  - "REVIEW-05's promotion rule: a version's parentVersionId counts only if walking the chain of parents above it terminates at an id absent from the version set, rather than revisiting an id already seen (via a new chainTerminates helper); a version whose chain closes on itself is treated exactly like an orphan and promoted to roots, with its parent edge dropped from `children` — which is what makes deleting the render-time visited-set guard on VersionNode safe."

requirements-completed: [REVIEW-01, REVIEW-02, REVIEW-03, REVIEW-04, REVIEW-05, REVIEW-06, REVIEW-07, REVIEW-08]

coverage:
  - id: D1
    description: "penReason removed as a dead prop from VersionRow.jsx, its test file, and the VersionRow call site in RecipePage.jsx; the live BatchRow call site and BatchRow.jsx's own declaration are untouched"
    requirement: "REVIEW-01"
    verification:
      - kind: unit
        ref: "npm --prefix app test (1004/1004 after Task 1)"
        status: pass
    human_judgment: false
  - id: D2
    description: "batchHistoryWords and its six-test describe block removed from the domain layer; latestChurnDate and its own tests untouched"
    requirement: "REVIEW-02"
    verification:
      - kind: unit
        ref: "grep -rn batchHistoryWords app/src (exit 1, no match)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The version-in-view class carries a CSS rule scoped to a descendant of the is-current list item"
    requirement: "REVIEW-03"
    verification:
      - kind: unit
        ref: "grep -cE against app/src/styles/app.css for the scoped selector (count 1) and the bare list-item selector (count 0)"
        status: pass
    human_judgment: true
    rationale: "The gates prove the rule's selector shape only; whether the chosen weight+outline treatment reads correctly against the batch entry's own is-current treatment, in a browser on a multi-version forked store, is deferred to end-of-phase UAT per the plan's own verification section."
  - id: D4
    description: "Neither flex-basis literal in the recipe-history block survives; both read new custom properties in tokens.css at their previous values"
    requirement: "REVIEW-04"
    verification:
      - kind: unit
        ref: "grep -cE flex: 1 1 [0-9] app/src/styles/app.css (0) and flex: 1 1 var\\(-- (2)"
        status: pass
    human_judgment: false
  - id: D5
    description: "A cyclic parent pair renders as two roots and the suite completes without hanging; the render-time visited-set guard is removed"
    requirement: "REVIEW-05"
    verification:
      - kind: unit
        ref: "app/src/ui/RecipeHistory.test.jsx#versionForest > promotes a cyclic pair to roots and drops the cycle from children, so a caller walking children terminates"
        status: pass
    human_judgment: false
  - id: D6
    description: "VersionNode's parent-to-children map is childrenByParent at every site; versionForest's returned shape (the children key) is unchanged"
    requirement: "REVIEW-06"
    verification:
      - kind: unit
        ref: "app/src/ui/RecipeHistory.test.jsx#versionForest (both pre-existing tests still read forest.children unchanged)"
        status: pass
    human_judgment: false
  - id: D7
    description: "A version of a different recipeId never renders in the outline"
    requirement: "REVIEW-07"
    verification:
      - kind: unit
        ref: "app/src/ui/RecipeHistory.test.jsx#RecipeHistory > does not render a version belonging to a different recipeId"
        status: pass
    human_judgment: false
  - id: D8
    description: "makeBatch declares churn once and behaves identically (overrides.churn still merges over defaults)"
    requirement: "REVIEW-08"
    verification:
      - kind: unit
        ref: "npm --prefix app test (1006/1006 after Task 3, all RecipeHistory.test.jsx cases using makeBatch pass unchanged)"
        status: pass
    human_judgment: false
  - id: D9
    description: "The whole change — pre-existing History work plus the eight fixes — committed on main as three atomic commits with attribution trailers, no branch, no push, no stash"
    verification:
      - kind: unit
        ref: "git log --oneline -3; git status --porcelain -- app DESIGN.md .impeccable (empty); git status -sb (main ahead of origin/main by 3, nothing pushed)"
        status: pass
    human_judgment: false

duration: ~5min
completed: 2026-09-18
status: complete
---

# Quick Task 260918-a5l: Clean up eight RecipeHistory review findings — Summary

**Eight code-review findings on the uncommitted recipe-level History disclosure closed — a dead prop, a dead domain function, an unstyled current-version class, two raw-length flex bases, a real cycle defect hidden behind an unreachable guard, a shadowed React prop, a lost regression test, and a duplicate object key — then the whole change (pre-existing History work plus the fixes) committed on `main` as three atomic commits.**

## Performance

- **Started:** 2026-09-18T07:30:02-04:00 (baseline test run, before any edit)
- **Completed:** 2026-09-18T07:34:57-04:00 (third commit)
- **Tasks:** 4 completed
- **Files modified:** 9

## Test count against the 1006 expectation

| Point | Expected | Actual |
|---|---|---|
| Baseline | 1010 | 1010 |
| After Task 1 (REVIEW-01, -02) | 1004 | 1004 |
| After Task 2 (REVIEW-03, -04) | 1004 | 1004 |
| After Task 3 (REVIEW-05 through -08) | 1006 | 1006 |
| After Task 4 (final, committed tree) | 1006 | 1006 |

No drift at any gate. `npm --prefix app run build` passed at every checkpoint (118 modules).

## Accomplishments

- **REVIEW-01:** `penReason` removed from `VersionRow.jsx`'s prop list, from `RecipePage.jsx`'s `<VersionRow>` element, and from `VersionRow.test.jsx`'s three render call sites. `BatchRow.jsx`'s live declaration, its call site in `RecipePage.jsx`, and `RecipePage.jsx`'s `derivePenState` derivation are untouched — `BatchRow` still reads `penReason` normally.
- **REVIEW-02:** `batchHistoryWords`, its JSDoc block, its import, and its six-test `describe` block deleted from `app/src/domain/batch.js` / `batch.test.js`. `latestChurnDate`, which it called, is untouched along with its own tests.
- **REVIEW-03:** `.recipe-history__version.is-current > .recipe-history__version-sheet` added to `app.css`, carrying `font-weight: 700` and the register's `outline`/`outline-offset` pair. Scoped to the sheet — a descendant of the is-current list item — because the list item also contains `.recipe-history__branches` (descendant version nodes); a rule on the bare list item would have bolded and enclosed versions not in view.
- **REVIEW-04:** the two raw-length flex bases in the recipe-history block (`22rem` on `.recipe-history__version-name`, `16rem` on `.recipe-history__batch-name`) now read `--rhist-vname-min` and `--rhist-bname-min`, defined in `tokens.css` at their unchanged previous values.
- **REVIEW-05:** wrote a failing test first (`versionForest` on a two-version cyclic pair) and watched it fail — `roots` came back empty, confirming the described defect. `versionForest` now determines a version's parent by walking the chain of parents above it via a new `chainTerminates` helper; a chain that revisits an id (rather than running out) is treated exactly like a missing parent, so a cyclic pair is promoted to two roots with the cycle dropped from `children`. That makes it safe to delete `VersionNode`'s unreachable `visited`-Set guard (the parameter, the per-render copy, the early return, and both pass-down sites), which is also done. The explanatory comment above `versionForest` is amended (not rewritten) to name the new case alongside the existing orphan case.
- **REVIEW-06:** `VersionNode`'s parent-to-children `Map` prop renamed `childrenByParent` at every site (declaration, both `VersionNode` render calls, `RecipeHistory`'s destructuring). `versionForest`'s returned key stays `children`, so the two pre-existing `versionForest` tests read it unchanged.
- **REVIEW-07:** restored the cross-recipe regression test lost with `VersionStrip.test.jsx` — a version carrying a different `recipeId` renders nothing in the outline and the version-node count stays at one. This test passed on first run (the existing `versionsForRecipe` filter already worked correctly); the coverage was missing, not the behavior.
- **REVIEW-08:** `makeBatch`'s duplicate `churn` key (declared once before the `overrides` spread, again after) reduced to the single declaration after the spread — the one that was already winning, so behavior is identical: `overrides.churn` still merges over the defaults.
- The whole change — the pre-existing uncommitted `RecipeHistory` disclosure plus these eight fixes — is now committed on `main` as three ordered atomic commits (see below). Nothing pushed, no branch created.

## Task Commits

Tasks 1-3 did not commit individually per the plan's execution constraints (sequential edits on the uncommitted working tree); Task 4 made all three commits at once, in the order the plan specified:

1. **The disclosure itself** — `4e31c0a` (`feat(recipe-history): the recipe-level History disclosure replaces VersionStrip`) — `RecipeHistory.jsx`/`.test.jsx` (new), `VersionStrip.jsx`/`.test.jsx` (deleted), `VersionRow.jsx`, `VersionRow.test.jsx`, `RecipeList.jsx`, `RecipePage.jsx`, `app.css`, `tokens.css`, `cross-cutting.test.js`. Carries REVIEW-01, -03, -04, -05, -06, -07, -08.
2. **The domain retirement** — `236075f` (`feat(recipe-history): retire batchHistoryWords, VersionStrip's last caller`) — `batch.js`, `batch.test.js` alone, landed after commit 1 so the tree never passes through a state where the deleted `VersionStrip` still imports a function that no longer exists. Carries REVIEW-02.
3. **The documents** — `abe364d` (`docs(recipe-history): document the recipe-level History outline`) — `DESIGN.md`, `.impeccable/surfaces/route-recipe-version.md` (pre-existing uncommitted doc edits, unrelated to the eight findings).

All three carry the `Co-Authored-By: Claude Opus 5 (1M context)` and `Claude-Session` trailers.

Because `git stash` is forbidden by the plan's execution constraints, the intermediate trees between these three commits were not checked out and independently re-tested — the ordering itself (disclosure, then the domain function its last caller stopped importing, then docs) is what keeps each commit buildable on its own, and that ordering is what was followed. Only the final, fully-committed tree was run through the test suite and build.

## Files Created/Modified

- `app/src/ui/VersionRow.jsx` — `penReason` removed from the prop list (REVIEW-01).
- `app/src/ui/VersionRow.test.jsx` — `penReason` removed from three render call sites (REVIEW-01).
- `app/src/ui/RecipePage.jsx` — `penReason={penReason}` removed from the `<VersionRow>` element only (REVIEW-01).
- `app/src/domain/batch.js` — `batchHistoryWords` and its JSDoc deleted (REVIEW-02).
- `app/src/domain/batch.test.js` — the `batchHistoryWords` import and its six-test `describe` block deleted (REVIEW-02).
- `app/src/styles/app.css` — a new scoped `.is-current` rule for the version's own sheet (REVIEW-03); two flex-basis literals replaced with `var(--rhist-vname-min)` / `var(--rhist-bname-min)` (REVIEW-04).
- `app/src/styles/tokens.css` — `--rhist-vname-min` and `--rhist-bname-min` added (REVIEW-04).
- `app/src/ui/RecipeHistory.jsx` — `chainTerminates` helper added; `versionForest`'s parent-counting rule changed to cover a closed cycle; `VersionNode`'s `visited` guard removed; `children` prop renamed `childrenByParent` throughout (REVIEW-05, REVIEW-06).
- `app/src/ui/RecipeHistory.test.jsx` — two new tests (cyclic-pair `versionForest`, cross-recipe `RecipeHistory` render) added; `makeBatch`'s duplicate `churn` key removed (REVIEW-05, REVIEW-07, REVIEW-08).

## Decisions Made

See `key-decisions` in the frontmatter for the exact REVIEW-03 selector, the REVIEW-04 token names, and the REVIEW-05 promotion rule.

## Deviations from Plan

None — plan executed exactly as written. All eight findings were closed by the mechanism the plan specified; no Rule 1-4 deviations were needed beyond what the plan itself called for.

## Out-of-scope observations (named, not fixed, per CLAUDE.md § 3)

1. **`app/src/domain/lineage.js` (~line 51)** carries a doc comment naming the deleted `VersionStrip.jsx` file. This is stale prose, not one of the eight findings — left untouched.
2. **`.history-register__item.is-current` in `app.css` (~line 793)** may now be unmatched: `BatchRow.jsx` renders the `history-register__item` class without ever pairing it with `is-current`, since the batch panel's own current-item marking moved to `RecipeHistory.jsx`'s `.recipe-history__batch.is-current`. Not one of the eight findings — left untouched. Worth a future look to confirm whether `.history-register__item.is-current` is now dead CSS.

## Deferred to end-of-phase UAT

REVIEW-03's visual treatment (weight 700 + the register's outline, scoped to `.recipe-history__version-sheet`) is a design call. The automated gates prove the rule exists and that its weight cannot reach a descendant version node (the branches subtree); whether the chosen declarations read correctly against the batch entry's own `is-current` treatment (`font-weight: 700` alone, no outline) wants a look in a browser on a multi-version, forked store. Recorded per `human_verify_mode: end-of-phase`.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The RecipeHistory disclosure is now fully committed on `main`, code-review-clean, with all eight findings closed and proven by gate.
- No blockers. The two named out-of-scope observations (stale doc comment, possibly-dead CSS selector) are candidates for a future quick task, not blockers for this one.

---
*Phase: quick-260918-a5l*
*Completed: 2026-09-18*

## Self-Check: PASSED

All nine claimed source/test files confirmed present on disk; all three commit SHAs (`4e31c0a`, `236075f`, `abe364d`) confirmed present in `git log`.
