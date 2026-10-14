---
phase: 03-develop-the-next-version
plan: 04
subsystem: recipe-versioning
tags: [react, react-router, tracked-changes, diff, accessibility]

# Dependency graph
requires:
  - phase: 03-03
    provides: the version record's new shape, the save ceremony's lineage line, the version strip, and domain/diff.js's buildDiff already used by the pen and by uses.js
provides:
  - The `changes` search parameter and its toggle in the lineage line — URL-addressable, composing with both /recipe/:id and /recipe/:id/batch/:batchId with no new route (D-02)
  - The live parent read through repository.getVersion, never a copy stored on the child (T-03-23); the toggle and the show-changes marks are absent whenever the parent record cannot be read (T-03-24, D-10)
  - The show-changes rendering in IngredientTable.jsx (grams/share/step strikes, the total row, a removed row struck at its own index) and Method.jsx (struck-beneath step text, struck target chips, the removed-step label, the stale-amount flag)
  - GraduatedRule.jsx's figureDelta prop — the struck head and the hollow parent tick, with "was X, now Y" in the accessible name
affects: [03-05 (the four advisories render in the same margin region, unaffected by this plan)]

# Actuals (#2632)
actuals:
  tokens: 11449
  tasks: 2
  commits: 2
plan_head_before: 2a12b242f5f9ee5795edd79da19bf9c65187a46f

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "One buildDiff of the version against its live parent, computed once in RecipePage and threaded unchanged into IngredientTable, Method and FormulationNote — never a second independent comparison of the same two records"
    - "A component-level isShowingChanges gate (`!isDeveloping && showingChanges && diff != null`), mirroring the existing isDeveloping gate, so the pen's own always-visible grammar and the show-changes state can never render at once even if both conditions happen to be true"
    - "Show-changes reads through ink (no .ink-field/.ink-text) even though the rendering logic (struck-beside, forced strike on removal) is identical in shape to the pen's own cells — the Two-Ink Rule enforced by omission of a class, not a colour override"

key-files:
  created:
    - app/src/ui/IngredientTable.test.jsx
    - app/src/ui/GraduatedRule.test.jsx
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/Headnote.jsx
    - app/src/ui/Headnote.test.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/FormulationNote.jsx
    - app/src/ui/GraduatedRule.jsx
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
    - app/src/styles/tokens.css
    - app/src/styles/app.css

key-decisions:
  - "GraduatedRule's figureDelta support is scoped to the show-changes state only, not to the pen's own developing mode — the plan's acceptance criteria, verify greps and human-check text all describe the struck head appearing after pressing show changes on a saved version; the brief's 'focal moment' describing it while the pen is open is read as illustrative of the same grammar, not a second call site this plan's own tests exercise. FormulationNote's diff prop is threaded only from the show-changes changeDiff, never from a pen-mode comparison."
  - "IngredientTable and Method take the precomputed diff two different ways: IngredientTable receives it as a plain diff prop (RecipePage's single buildDiff call, matching the plan's key_link), while Method receives it alongside draftVersion/baselineVersion reuse and recomputes internally for its own developing-mode branch (03-02's existing pattern, unchanged) — the two approaches converge on the identical buildDiff(version, parentVersion) call for show-changes."
  - "RecipePage.jsx's Method/FormulationNote prop threading for Task 2 landed in Task 1's commit alongside the diff computation itself, since both tasks share the same file and the same changeDiff variable; the components that consume those props (Method.jsx, FormulationNote.jsx, GraduatedRule.jsx) were added in Task 2's commit. The extra props are inert (ignored) until Task 2 wires them, so the app was in a working, fully-tested state after Task 1's commit."

requirements-completed: [FORM2-01]

coverage:
  - id: D1
    description: "One toggle in the lineage line lays the pen's grammar back on a saved version, addressable by a `changes` search parameter on the version's own URL, with no new route and with back returning to the clean reading (FORM2-01, D-02)."
    requirement: "FORM2-01"
    verification:
      - kind: unit
        ref: "app/src/ui/Headnote.test.jsx#Headnote — the show-changes toggle (D-02, D-10) (3 tests)"
        status: pass
      - kind: automated_ui
        ref: "npm --prefix app run build && npm --prefix app test (acceptance-criteria greps: useSearchParams present, no window.location.search/history.pushState/useBlocker, router still declares exactly 3 routes)"
        status: pass
    human_judgment: true
    rationale: "The interactive flow — pressing the toggle, watching the URL gain the parameter and the marks appear, pressing back, copying the URL into a new tab — needs a browser to observe. Deferred to end-of-phase UAT per Mark's standing preference (STATE.md carry, MEMORY.md), consistent with every prior plan in this phase."
  - id: D2
    description: "Per row the change reads in grams and in % of batch — a row whose grams held but whose share moved shows the share strike alone; the total row shows the parent's total struck before the current one; a removed row reappears whole and struck at its original index; a mark appears only where the printed value differs (FORM2-01)."
    requirement: "FORM2-01"
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientTable.test.jsx (4 tests: never-reorders/removed-row-struck, share-alone, no-strike-when-equal, ink-not-pen-blue)"
        status: pass
      - kind: automated_ui
        ref: "grep gate: no improv|regress|better|worse|arrow glyph in IngredientTable.jsx"
        status: pass
    human_judgment: false
  - id: D3
    description: "Per figure the head shows the parent's value struck and the scale shows the parent's tick hollow, with the accessible name carrying 'was X, now Y'; the rule computes no comparison of its own (FORM2-01)."
    requirement: "FORM2-01"
    verification:
      - kind: unit
        ref: "app/src/ui/GraduatedRule.test.jsx (6 tests: no-delta, changed struck head + hollow tick, accessible name, unchanged renders neither)"
        status: pass
      - kind: automated_ui
        ref: "grep gates: no buildDiff/buildFigures/computeBalance call, no hex colour literal in GraduatedRule.jsx"
        status: pass
    human_judgment: false
  - id: D4
    description: "A changed step shows the parent's text struck beneath, a changed target chip shows the old chip struck before it, a removed step reappears struck with the word 'removed' as a sibling, and the stale-amount flag shows in show-changes as well as in the pen and never in the clean reading."
    verification:
      - kind: unit
        ref: "app/src/ui/Method.test.jsx (3 new tests: read-only show-changes rendering, removed-step sibling label, clean reading renders nothing even with a diff supplied)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Nothing ranks: no wording, weight, order or mark says a change was an improvement or a regression, anywhere on the page."
    verification:
      - kind: other
        ref: "grep gates: no improv|regress|better|worse|arrow glyph in IngredientTable.jsx, FormulationNote.jsx, Method.jsx, Authored.jsx"
        status: pass
    human_judgment: false

# Metrics
duration: 27min
completed: 2026-09-07
status: complete
---

# Phase 3 Plan 4: Show changes — the toggle, the live parent, and the struck grammar Summary

**A `?changes` URL toggle in the lineage line that reads the live parent record through the repository and lays the pen's exact strike-and-beside grammar back onto a saved version's table, rules, method and steps — one `buildDiff` call threaded everywhere, both values in ink.**

## Performance

- **Duration:** 27 min
- **Started:** 2026-09-07T19:05:00Z
- **Completed:** 2026-09-07T19:32:08Z
- **Tasks:** 2 completed
- **Files modified:** 12 (2 created, 10 modified)

## Accomplishments

- `RecipePage.jsx`: `useSearchParams` drives the `changes` state (`searchParams.has('changes')` / `setSearchParams`), composing with both recipe routes with no new route; a cancelled-flag effect reads the live parent through `repository.getVersion`; one `buildDiff(version, parentVersion)` computed once and threaded into every consuming region
- `Headnote.jsx`: the lineage line gains one toggle, `show changes from <parent line>`, carrying `aria-pressed`, absent when the version has no parent or the parent record could not be read
- `IngredientTable.jsx`: a new show-changes row rendering, entirely read-only and in ink — grams, share and step strike independently from the same `buildDiff` row descriptor, a removed row reappears whole and struck at its own index, and the total row strikes the parent's total before the current one
- `GraduatedRule.jsx`: a new `figureDelta` prop — the struck head, the hollow parent tick (`<rect fill="none">` at the graduation weight), and `was X, now Y` in the accessible name; the rule still computes no comparison of its own
- `FormulationNote.jsx`: passes each figure its own `figureDelta`, matched by `key`, from the diff `RecipePage` already computed
- `Method.jsx`: a read-only show-changes render path — struck-beneath step text, struck target chips, a removed step's sibling "removed" label, and the stale-amount flag shown in the pen and in show-changes alike, never in the clean reading

## Task Commits

1. **Task 1: The state and the grammar in the table** — `04e112b` (feat)
2. **Task 2: The grammar in the rules, the method and the notes** — `3bc0205` (feat)

**Plan metadata:** committed separately below.

## Files Created/Modified

- `app/src/ui/RecipePage.jsx` — the `changes` search parameter, the live parent effect, `changeDiff`/`changeStaleSteps`, the toggle handler
- `app/src/ui/Headnote.jsx` — the show-changes toggle in the lineage line
- `app/src/ui/Headnote.test.jsx` — 3 new tests for the toggle
- `app/src/ui/IngredientTable.jsx` — `DiffGramsCell`/`DiffStepCell`/`DiffShareCell`, `rowDiffAccessibleLabel`, the `isShowingChanges` row and total-row branches
- `app/src/ui/IngredientTable.test.jsx` — 4 tests
- `app/src/ui/GraduatedRule.jsx` — `figureDelta`, the struck head, the hollow tick
- `app/src/ui/GraduatedRule.test.jsx` — 6 tests
- `app/src/ui/FormulationNote.jsx` — `diff` prop, per-figure `figureDelta` matched by key
- `app/src/ui/Method.jsx` — `changeDiff`/`staleSteps`/`showingChanges` props, the `isShowingChanges` step branch
- `app/src/ui/Method.test.jsx` — 3 new tests
- `app/src/styles/tokens.css` — `--rule-tick-hollow`
- `app/src/styles/app.css` — `.headnote__show-changes`

## Decisions Made

- `GraduatedRule`'s `figureDelta` support is scoped to the show-changes state only, not the pen's own developing mode — matching this plan's own acceptance criteria, verify greps and human-check text; `FormulationNote`'s `diff` prop is threaded only from the show-changes `changeDiff`.
- `IngredientTable` takes the precomputed `diff` as a plain prop; `Method` recomputes internally from `draftVersion`/`baselineVersion` reuse (its existing 03-02 pattern) — both converge on the identical `buildDiff(version, parentVersion)` call for show-changes.
- `RecipePage.jsx`'s Method/FormulationNote prop threading for Task 2 landed in Task 1's commit (shared file, shared `changeDiff` variable); the consuming components landed in Task 2's commit. The extra props are inert until Task 2 wires them, so the app was fully working and tested after each commit.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The show-changes state is complete at the domain and component level: the toggle, the live parent read, the table's strikes, the rule's struck head and hollow tick, and the method's struck-beneath grammar and stale-amount flag.
- **Deferred to end-of-phase UAT** (per Mark's standing preference, MEMORY.md and every prior plan in this phase): the full interactive flow — pressing the toggle, watching the marks arrive and the URL change, pressing back, copying the URL with the parameter into a new tab, and opening the churned version (which has no parent) to confirm no toggle renders. All automated verification (build, test — 331 passing, up from 315 at the end of 03-03 — and every acceptance-criteria grep) has been run and passes; only the visual/interactive confirmation is deferred.
- `03-05` still needs the four FORM2-02 advisories — unaffected by this plan, which left the margin's advisory slot untouched.

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-07*

## Self-Check: PASSED

- Key created/modified files verified present on disk: `app/src/ui/RecipePage.jsx`, `app/src/ui/Headnote.jsx`, `app/src/ui/Headnote.test.jsx`, `app/src/ui/IngredientTable.jsx`, `app/src/ui/IngredientTable.test.jsx`, `app/src/ui/FormulationNote.jsx`, `app/src/ui/GraduatedRule.jsx`, `app/src/ui/GraduatedRule.test.jsx`, `app/src/ui/Method.jsx`, `app/src/ui/Method.test.jsx`, `app/src/styles/tokens.css`, `app/src/styles/app.css`.
- Both task commits verified present in git log: `04e112b`, `3bc0205`.
- `npm --prefix app test` re-run: 21 test files, 331 tests passed (baseline at the end of 03-03 was 315).
- `npm --prefix app run build` re-run: builds clean, no errors.
- All plan-level `<verify>` automated greps re-run and passed (see the two task sections above).
