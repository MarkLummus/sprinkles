---
phase: 08-split-the-recipe-page-along-its-jobs
plan: 03
subsystem: ui
tags: [react, refactor, component-extraction, vitest, webkit-walk, creation-editor-seam]

requires:
  - phase: 08-split-the-recipe-page-along-its-jobs
    provides: plan 02's pure sheetView (with markedFigure and a nullable baseline) and the shell test's job table
provides:
  - cut 4 of 6: RecipeSheet.jsx, the Sheet's article as one component the editing page renders and Phase 10's creation editor will mount
  - RecipeSheet.test.jsx, six node tests that mount it with no stored version and no baseline, empty and populated
  - four source-text describes in RecipePage.test.jsx re-pointed to the module that now holds their code (D-11)
affects: [08-04, 08-05, phase-10]

actuals:
  tokens: 9000
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "A shared child owns its own UI state (focus trace, two-column read, Balance fold) and takes everything else as props; the caller's batch-side element arrives as a foot slot"
    - "A source-text describe whose code moved changes only its readFileSync target; a describe that spans both files joins the page and the sheet with '\\n' before its comment-stripping chain"

key-files:
  created:
    - app/src/ui/RecipeSheet.jsx
    - app/src/ui/RecipeSheet.test.jsx
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/ui/RecipePage.shell.test.js

key-decisions:
  - "RecipeSheet takes view plus the explicit prop list the plan names; handlers have no defaults, the diff and batch-side props default to null/false, so a caller passes only view, version, mode and penDraft"
  - "baseline reaches Method through view.baseline (sheetView returns it), so Method's baselineVersion is the caller's baseline, not the stored version; the editing page still passes baseline: version"
  - "The shell's fold comment lost its Balance and Watch for sentences, which travelled with the code; the Batch fold comment lost its 'beside Balance's' clause"

patterns-established:
  - "Phase 10 mounts RecipeSheet with sheetView({ ..., baseline: null }) and no foot"
  - "The shell test's JOBS entry for a component sets hook: false, call '<RecipeSheet', allow ['react', './']"

requirements-completed: []
requirements-advanced: [EDIT-05, EDIT-06]  # shared with plans 01-02, 04-05; REQUIREMENTS.md deliberately not touched by this plan

duration: 3min
completed: 2026-10-17
status: complete
commits: 2
plan_head_before: c8ae92e9f3b213eb07c84d1bf5b7e216b5acd977
plan_head_after: b2264ca1878bab2ff6fba59fb1d9406e7f9d5164
---

# Phase 8 Plan 03: The Sheet as RecipeSheet Summary

**The Sheet's article now renders through a `RecipeSheet` component that owns its focus trace, two-column read and Balance fold and takes the pen foot as a slot; it mounts over an unstored version with no baseline, and the walk still matches 94 snapshots.**

Base commit: c8ae92e9f3b213eb07c84d1bf5b7e216b5acd977

## Performance

- **Duration:** about 3 min
- **Completed:** 2026-10-17
- **Tasks:** 2 (both `type="auto"`, no checkpoints)
- **Files:** 5 (2 created, 3 modified)

## Accomplishments

- `RecipeSheet({ view, version, mode, penDraft, draft, parentVersion, showingChanges, openPen, below724, blockedTarget, blockedMessage, versionSaveAction, batchSaveAction, foot, onChangePenField, … onRestorePenStep })` holds the article, Headnote, Before you start, the Ingredients section with `IngredientsHead` and the table, Instructions, the Balance fold with its focus-trace announcement, Watch for, and `{foot}`. It imports only `react` and sibling `./` modules, so it never reaches the store (T-08-08).
- `RecipePage.jsx` renders `<RecipeSheet` once inside `notebook-body__sheet`, passes `<PenFoot … />` as `foot`, and keeps the band, history, the Batch aside, `useBelowDesktop`, `useBelow724` and the Batch fold above its early returns. It dropped twelve imports and went from 1,505 to 1,351 lines.
- The shell test names `RecipeSheet` positively (`NEW_MODULES`, a `JOBS` entry with seven markers and eight `shellLacks` needles).
- `RecipeSheet.test.jsx` proves the component mounts with no stored version and no baseline, with no store mock and no `vi.mock(`.

## Cut record

| Cut | Commit | Walk check | Suite (files / tests) | RecipePage.jsx lines |
|-----|--------|------------|-----------------------|----------------------|
| Start (after cut 3) | fa2f491 | MATCH 94 snapshots | 94 / 2963 | 1,505 |
| Cut 4, RecipeSheet | `f203b57cac70d013020510af5bef8a22ae2ff8eb` | MATCH 94 snapshots | 94 / 2967 | 1,351 |
| Task 2, D-09 tests | `b2264ca1878bab2ff6fba59fb1d9406e7f9d5164` | not re-run (tests only) | 95 / 2973 | 1,351 |

Cut 4 added 4 cases (the new module through `NEW_MODULES`' three `it.each` checks, and its `JOBS` case). Task 2 added 6. No test was deleted, skipped or weakened. RecipePage.folds, a11y, perStep and beforeYouStart passed unchanged with the focus trace, `useSheetTwoColumns()` and the Balance fold inside `RecipeSheet.jsx`; the fallback was not needed and no prop-lifted variant exists. `RecipeSheet.jsx` is now 235 lines. `git show --stat` of cut 4 lists exactly `RecipeSheet.jsx`, `RecipePage.jsx`, `RecipePage.test.jsx` and `RecipePage.shell.test.js`.

## The four re-pointed describes (D-11)

| Describe (opening line) | Old read target | New read target |
|-------------------------|-----------------|-----------------|
| "the running head is gone; PageStatus anchors outside the keyed page" (`thisFilesRecipePageSource` only; the router read is untouched) | RecipePage.jsx | RecipePage.jsx and RecipeSheet.jsx, joined with `'\n'`, page first |
| "the steps region is named Instructions" | RecipePage.jsx | RecipeSheet.jsx |
| "the empty Instructions section is left out" | RecipePage.jsx | RecipeSheet.jsx |
| "RecipePage.jsx — the Ingredients heading carries Show changes below 724 through the one handler" | RecipePage.jsx | RecipePage.jsx and RecipeSheet.jsx, joined with `'\n'`, page first |

Every changed line in `RecipePage.test.jsx` holds `readFileSync(`, `new URL(`, `fileURLToPath(` or `.join(`; a check over `git diff f203b57^..f203b57` for any other changed line printed nothing. The 1288 describe still sees `onToggleShowChanges={handleToggleShowChanges}` exactly twice (VersionRow and RecipeSheet, both in the shell), one `function handleToggleShowChanges(`, and one `<IngredientsHead` inside the Ingredients section. The tests at 999 (one Link), 1218 (GoToBatch) and 1248 (below 724 and `handleStartTasting`) still find their code in the page and were not touched.

## Fixture fields

The empty fixture `{ id, recipeId, rows: [], method: [], authored: { beforeYouStart: [] }, declaredAxes: [] }` needed no extra field: no child threw on it in reading or in developing, and no populated case threw either. Nothing was added to any fixture.

## Phase 10 limitation

With `baseline: null`, RecipeSheet's ingredient pen is editable (`aria-label="Whole milk, grams, portion 1"` is present in developing) but Method's steps render read-only, because Method's `isDeveloping` is `mode === 'developing' && draftVersion != null && baselineVersion != null` (Method.jsx 593). The test "developing with no baseline" pins that no `, edit this step"` control appears, and the control case with `baseline: inMemory` shows it appears once a baseline is given. Phase 10's `creating` mode must give Method a way to edit steps with no baseline; Phase 8 does not change it (D-09).

## Task Commits

1. **Task 1: cut 4, the Sheet renders through RecipeSheet** - `f203b57cac70d013020510af5bef8a22ae2ff8eb` (refactor)
2. **Task 2: RecipeSheet renders with no stored version and no baseline** - `b2264ca1878bab2ff6fba59fb1d9406e7f9d5164` (test)

## Deviations from Plan

None - plan executed exactly as written. (Two comment sentences in `RecipePage.jsx` were trimmed to match the code that left: the fold comment's Balance and Watch for sentences moved into `RecipeSheet.jsx`, and the Batch fold comment no longer says it sits "beside Balance's". No code changed in either.)

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. `RecipeSheet.jsx` renders text children only (T-08-07; the shell test's no-`dangerouslySetInnerHTML` case now iterates it through `NEW_MODULES`, and `tabindex-scan` reads it as a non-test `.jsx`). Its imports are `react` and `./` modules only, enforced by the `allow` list (T-08-08). No package, network call, stored shape or database version changed.

## Issues Encountered

None.

## Next Phase Readiness

Plan 08-04 can start from `b2264ca`. For plans 04-05:

- `RecipePage.jsx` is 1,351 lines. The hook calls above the early returns are `useAnnouncer()`, `useRecipeData(versionId)`, `useRecordDraft()`, then `usePenDraft()`, `useBelowDesktop()`, `useBelow724()` and the Batch fold's `useFold(true)`. `useFold` is still imported for the Batch fold only.
- The shell still holds every `handleX` handler. It hands `RecipeSheet` the pen handlers as `onChangePenField`, `onChangePenNoteText`, `onRemovePenNote`, `onToggleShowChanges`, `onChangeAsMade`, `onChangePenGrams`, `onTogglePenRowRemoved`, `onTogglePenLineRemoved`, `onChangeStepChange`, `onChangePenStepField`, `onChangePenStepTarget`, `onTogglePenStepUses`, `onTogglePenStepRemoved` and `onRestorePenStep`. If plan 04 moves the pen handlers into `useVersionPen`, these props keep their names; only where the shell gets the functions changes.
- `view.baseline` is read inside RecipeSheet for Method's `baselineVersion`; the shell passes `baseline: version` to `sheetView`.
- Base commit for the test audit stays `78e962d8c988d735cf5f3c505e049b480e77ad6b`. This plan's only edits to existing test cases are the four read-target changes above; no `expect(`, `it(` or `describe(` line changed.
- Walk check: `sh .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-check.sh`, no `08-walk-before.json` needed.

## Self-Check: PASSED

- Files exist: `app/src/ui/RecipeSheet.jsx`, `app/src/ui/RecipeSheet.test.jsx`.
- Commits are ancestors of HEAD: f203b57, b2264ca.
- `git rev-list --count c8ae92e..HEAD` is 2, matching `commits: 2`.
- Full suite 95 files, 2973 tests, 0 failed; walk check after cut 4 ends `MATCH 94 snapshots`.
- `RecipeSheet.test.jsx` has no docblock on its first line and no `vi.mock(`; `npm --prefix app test -- RecipeSheet` reports 6 passed.
