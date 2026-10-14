---
phase: 05-split-the-recipe-page
plan: 02
subsystem: ui
tags: [react, domain-module, vitest, own-property-lookup, refactor]

requires:
  - phase: 05-split-the-recipe-page
    provides: "05-walk.mjs and 05-walk-before.json (Plan 01), the end-to-end before/after check"
provides:
  - "app/src/domain/penDraft.js: penDraftRow, usesListsDiffer, isPenDraftDirty, toggleDraftRowLines, derivePenState, restoreStepFromVersion (pure, framework-free)"
  - "Every read of a pen draft row by row id goes through penDraftRow (own-property check)"
affects: [05-03 usePenDraft hook, 05-04 record helpers (imports usesListsDiffer back for isDraftDirty), 05-06 after walk]

requirements-completed: [EDIT-01]

plan_head_before: 21014813e3c058f658a140e6c38f89ef8a161051
plan_head_after: b4a140d945ad78806c38332b9f458e008700095e

actuals:
  tokens: 4500     # chars/4 over the new/changed source and test files (rough)
  tasks: 2
  commits: 2       # measured: git rev-list --count 2101481..HEAD, before this SUMMARY's own commit

tech-stack:
  added: []
  patterns:
    - "Domain module with a leading 'Pure. No framework, no DOM, no store import.' comment, explicit .js relative imports, named exports only"
    - "Row-id lookups into penDraft.rows go through penDraftRow, never a bare bracket read"

key-files:
  created:
    - app/src/domain/penDraft.js
    - app/src/domain/penDraft.test.js
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/RecipePage.test.jsx

key-decisions:
  - "penDraftRow returns undefined for a non-own key and callers add no guard: penDraft.rows is built from the same version.rows every caller iterates, and a restored draft must pass draftMatchesVersion, so undefined is unreachable through the app"
  - "usesListsDiffer is exported from penDraft.js (not private) because the record pen's isDraftDirty, which stays in RecipePage.jsx until Plan 04, uses it"

coverage:
  - id: D1
    description: "penDraftRow: an own-property draft-row accessor serving all five reads (IngredientTable GramsCell and renderDevelopingEntry; isPenDraftDirty, the draft version, the save's rows); a prototype name never resolves"
    requirement: EDIT-01
    verification:
      - kind: unit
        ref: "app/src/domain/penDraft.test.js#penDraftRow"
        status: pass
      - kind: other
        ref: "node 05-walk.mjs compare 05-walk-before.json <after>: MATCH 94 snapshots"
        status: pass
    human_judgment: false
  - id: D2
    description: "The four pen helpers and their private comparers live in domain/penDraft.js, pure, tested under node (no mutation, same input twice, step identity, no module-level let or var); RecipePage.jsx imports them with no re-export; RecipePage.test.jsx changes imports only"
    requirement: EDIT-01
    verification:
      - kind: unit
        ref: "app/src/domain/penDraft.test.js; app/src/ui/RecipePage.test.jsx (108 it( calls, same as 4f1f98f)"
        status: pass
      - kind: other
        ref: "node 05-walk.mjs compare 05-walk-before.json <after>: MATCH 94 snapshots"
        status: pass
    human_judgment: false

duration: ~5min
completed: 2026-10-14
status: complete
---

# Phase 5 Plan 02: Pen helpers to domain Summary

**Pen draft helpers (dirty check, row-lines toggle, pen-state derivation, one-step restore) moved from RecipePage.jsx into framework-free `domain/penDraft.js`, with every draft-row read by id going through an own-property accessor `penDraftRow` (closes T-03.6-02)**

## Performance

- **Duration:** about 5 min of work (clock read at start 10:43Z, end 10:47Z)
- **Tasks:** 2 (one tracer, one auto)
- **Files:** 2 created, 3 modified
- **Suite:** 80 files, 2551 tests, all passing (baseline was 79 files, 2536; the new file adds 15)

## Accomplishments

- `penDraftRow(penDraft, rowId)` answers only for own keys of `penDraft.rows`; `__proto__`, `constructor`, `toString` and `hasOwnProperty` return undefined, while an own key named `__proto__` is still found. All five bare `penDraft.rows[row.id]` reads (two in IngredientTable.jsx, three in RecipePage.jsx) use it.
- `isPenDraftDirty`, `toggleDraftRowLines`, `derivePenState`, `restoreStepFromVersion` and the private `normalizedText`, `targetsDiffer`, `isStepDirty`, `isAuthoredListDirty` moved verbatim with their comments. `usesListsDiffer` moved too and is exported, imported back into RecipePage.jsx for `isDraftDirty`.
- RecipePage.jsx lost 148 lines and imports the helpers; nothing is re-exported. RecipePage.test.jsx's four pen-helper describes run unchanged against the new import path, under node (108 `it(` calls, equal to 4f1f98f).
- The built app compares `MATCH 94 snapshots` against `05-walk-before.json` after each task.

## Task Commits

1. **Task 1 (tracer): penDraftRow end to end** - `4b19ec3` (feat)
2. **Task 2: the four pen helpers and their private comparers move to penDraft.js** - `b4a140d` (refactor)

**Plan metadata:** committed after this file (docs: complete plan)

## Files Created/Modified

- `app/src/domain/penDraft.js` - the pen's pure draft helpers; imports only `./rows.js`
- `app/src/domain/penDraft.test.js` - node tests: penDraftRow (own, absent, prototype names, own `__proto__`, no mutation); the four moved helpers (no mutation, same input twice); restoreStepFromVersion identity; no module-level `let` or `var`
- `app/src/ui/RecipePage.jsx` - declarations removed; imports from `../domain/penDraft.js`
- `app/src/ui/IngredientTable.jsx` - two reads go through `penDraftRow`
- `app/src/ui/RecipePage.test.jsx` - imports only

## Decisions Made

See key-decisions: undefined from `penDraftRow` is unguarded at callers because it is unreachable; `usesListsDiffer` is a public export of penDraft.js until Plan 04 moves `isDraftDirty`.

## Deviations from Plan

None - plan executed exactly as written.

Environment note (not a deviation): the fresh worktree had no `app/node_modules`; it was copied from the main checkout with `cp -Rc`, as the dispatch instructed. No package was installed; `app/package.json` and `app/package-lock.json` are unchanged (T-05-SC). The sandbox rejects compound commands with variables in worktrees, so the walk was run with literal scratch paths under the session scratchpad, in separate commands (build, record, compare), not the plan's single `&&` chain. Same three steps, same result.

## Noticed, not changed

Comments in other files that still name RecipePage.jsx as the home of these helpers (left as they are under the surgical rule):

- `app/src/ui/Method.jsx` line 581: "RecipePage.jsx's own restoreStepFromVersion"
- `app/src/domain/stepNumbers.js` line 3: "RecipePage.jsx's four pen step handlers match on it" (this one names the handlers, which stay in RecipePage.jsx until Plan 03; it may need no change)

Also unchanged, because D-03 names exactly five sites: `app/src/domain/lineage.js` about line 224 (`findBlockedRow`) reads `penFields.rows[row.id]` with no own-key check. (`app/src/domain/draft.js` about line 202 reads the same way, but only after its own `has()` check.)

## Threat Notes

- T-03.6-02 (row-id lookup against Object.prototype) is closed for the five D-03 sites: T-05-02 mitigated by `penDraftRow` and its node test with `__proto__`, `constructor`, `toString`, `hasOwnProperty`.
- T-05-03 (moved dirty check decides whether a kept draft is written or deleted): helpers moved verbatim; the existing describes pass unchanged; the walk's kept-draft scenarios compare MATCH.
- T-05-SC: no package installed.

## Issues Encountered

None.

## Known Stubs

None.

## Threat Flags

None.

## Next Phase Readiness

Ready for Plan 03 (`usePenDraft`). The pen's pure helpers have one home in `domain/penDraft.js`; the hook can import `penDraftRow` and add its per-edit ops there.

## Self-Check: PASSED

- FOUND: app/src/domain/penDraft.js, app/src/domain/penDraft.test.js
- FOUND: 4b19ec3, b4a140d (both ancestors of HEAD)
- Acceptance greps: 2 and 3 `penDraftRow(penDraft, row.id)` sites; no bare `penDraft.rows[` in either file; no moved function declared in RecipePage.jsx; penDraft.js imports only `./rows.js`; `it(` count 108 equals base; `from '../domain/penDraft.js'` appears once in RecipePage.test.jsx; no `@vitest-environment` docblock in penDraft.test.js
- `npm --prefix app test`: 80 files, 2551 tests passed; walk compare: MATCH 94 snapshots
