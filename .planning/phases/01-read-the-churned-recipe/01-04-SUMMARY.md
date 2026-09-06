---
phase: 01-read-the-churned-recipe
plan: 04
subsystem: recipe-read
tags: [react, vitest, accessibility, json-transfer, prototype-pollution]

requires:
  - phase: 01-03
    provides: "The figures module (buildFigures, FIGURE_SPECS) with per-figure basis, estimatedRowNames, and contributorRowIds; six graduated rules under the ingredient table"
provides:
  - "The estimated/unreviewed flag in both D-04 placements: on the ingredient table's own Data column (derived per row from weakestRowBasis) and beside each affected balance figure, naming the rows it rests on"
  - "The signature trace-to-contributors interaction: focusing a balance figure marks the ingredient rows in its contributorRowIds with outline and weight only, nothing moving"
  - "The whole-store JSON transfer contract (exportStore, validateStoreFile, importStore) behind the repository seam, with collect-all-errors validation and prototype-pollution rejection"
  - "Export/Import controls on the recipe list, reading/writing local files only — no network API anywhere under app/src"
  - "Both CLAUDE.md files recording app/ as the workspace and the ratified React + Vite + JSX stack"
affects: ["phase-02-batch-record", "phase-03-develop-next-version", "phase-04-print"]

actuals:
  tokens: 8527
  tasks: 3
  commits: 6

tech-stack:
  added: []
  patterns:
    - "Per-row basis derivation: IngredientTable computes a row's weakest basis from its own composition fields (weakestRowBasis), mirroring figures.js's per-figure ranking but applied per row — no hand-typed ingredient names anywhere in the component"
    - "GraduatedRule is a focusable <button> whose one aria-label carries the full sentence (label, value, target, basis and its rows); its inner markup is aria-hidden so nothing is announced twice"
    - "Marking-by-outline: focused-figure row marking and figure focus indicators both use outline + font-weight only, reading the direction contract's --focus-outline-* tokens, so nothing reflows on focus change"
    - "Collect-all-errors validation: validateStoreFile never short-circuits on the first fault, and scans for prototype-mutating own keys (__proto__, constructor, prototype) via Object.keys (never property access that could invoke a setter) before any other check"

key-files:
  created:
    - app/src/store/transfer.js
    - app/src/store/transfer.test.js
  modified:
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/GraduatedRule.jsx
    - app/src/ui/FormulationNote.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipeList.jsx
    - app/src/styles/app.css
    - CLAUDE.md
    - .claude/CLAUDE.md

key-decisions:
  - "The ingredient table's new data column is headed \"Data\" — the direction contract names block regions (Headnote, Ingredient table, ...) but does not assign a column header for this flag; \"Data\" was chosen as the plain-language name matching the artifact's own description (\"a data column carrying the estimated word\")."
  - "Row accessible names are built explicitly (aria-label on <tr>, composing ingredient name + grams + data flag +, when marked, the contributing-figure clause) rather than relying on default per-cell reading, so the flag and the trace are both provably in the accessible name, not only the visual rendering, per the plan's own acceptance criteria."
  - "GraduatedRule became a native <button> wrapping its (now aria-hidden) drawing, with the accessible name on the button itself — the standard pattern for a focusable control whose visual content is decorative relative to its one stated sentence."
  - "Hover-as-alternate-trigger for figure focus (the brief's 'may') was not implemented: the plan requires keyboard focus to always work and only permits hover as an addition, not a requirement; adding it would need cross-row focus/hover state reconciliation the plan doesn't ask for (CLAUDE.md simplicity-first)."

requirements-completed: [FORM1-02]

coverage:
  - id: D1
    description: "The ingredient table's Data column prints \"estimated\" on exactly the four rows whose weakest composition-field basis is estimated (whole milk, heavy cream, allulose, fine sea salt), derived rather than typed, and carries the word in the row's accessible name"
    requirement: "FORM1-02"
    verification:
      - kind: unit
        ref: "renderToStaticMarkup(<IngredientTable rows={oliveOilVersion.rows} />) inspected directly during execution — 4 cells render exactly \"estimated\", row aria-labels include the flag word on those four rows and no others"
        status: pass
      - kind: other
        ref: "npm --prefix app test (72 passing); npm --prefix app run build"
        status: pass
    human_judgment: true
    rationale: "The plan's own <verify> defers the full visual read (word visible without hovering/focusing, not the only thing a colour does) to a <human-check> harvested at end-of-phase per workflow.human_verify_mode=end-of-phase; the mechanical facts behind it (exact flagged rows, no colour literal, accessible name) are confirmed above."
  - id: D2
    description: "PAC, POD, MSNF, and Total solids print the basis word and estimatedRowNames beside the figure and in its accessible name; Total fat and Sugar solids print no flag"
    requirement: "FORM1-02"
    verification:
      - kind: unit
        ref: "renderToStaticMarkup(<FormulationNote version={oliveOilVersion} />) inspected directly during execution — exact aria-labels: PAC names Whole milk/Heavy cream/Allulose/Fine sea salt; POD names Whole milk/Heavy cream/Allulose; MSNF and Total solids name Whole milk/Heavy cream; Total fat and Sugar solids carry no basis clause"
        status: pass
      - kind: other
        ref: "grep -c estimatedRowNames app/src/ui/GraduatedRule.jsx (>=1); grep for colour literal (0 matches) in IngredientTable.jsx and GraduatedRule.jsx"
        status: pass
    human_judgment: true
    rationale: "Same end-of-phase human-check deferral as D1 — visual legibility of the flag beside the figure."
  - id: D3
    description: "Focusing any of the six balance figures (keyboard or pointer) marks exactly its contributorRowIds in the ingredient table using outline and weight only; blurring clears the mark; no element's position or size differs between states"
    requirement: "FORM1-02"
    verification:
      - kind: unit
        ref: "renderToStaticMarkup with markedRowIds=figure.contributorRowIds for pac/msnf/sugar inspected directly during execution — marked-row counts 7/3/3 match contributorRowIds.length exactly for each"
        status: pass
      - kind: other
        ref: "npm --prefix app test (72 passing); npm --prefix app run build; grep -c contributorRowIds app/src/ui/RecipePage.jsx (>=1)"
        status: pass
    human_judgment: true
    rationale: "The plan's own <verify> defers the pixel-identical-layout and keyboard-tab-order checks to a <human-check> harvested at end-of-phase; the mechanical facts (correct marked-row sets, wiring, no colour literal) are confirmed above."
  - id: D4
    description: "The whole store round-trips through JSON (exportStore -> importStore into a second repository yields deep-equal records); validateStoreFile collects every error rather than stopping at the first; a payload with a prototype-mutating key is rejected and a fresh object stays unpolluted; importStore on any invalid payload writes nothing"
    requirement: "FORM1-02"
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js — 15 tests: export shape, round trip, all validateStoreFile field checks, two-distinct-faults reports two errors, prototype-mutating-key rejection, importStore no-partial-write"
        status: pass
    human_judgment: false
  - id: D5
    description: "Export/Import controls on the recipe list are keyboard-reachable, labelled, use only local file reading (no network API anywhere under app/src), and render import errors as text beside the controls without replacing or clearing the store"
    requirement: "FORM1-02"
    verification:
      - kind: other
        ref: "test \"$(grep -rIhE 'fetch\\(|XMLHttpRequest|sendBeacon|EventSource|WebSocket' app/src ... | wc -l)\" = 0; npm --prefix app run build; npm --prefix app test"
        status: pass
    human_judgment: true
    rationale: "The plan's own <verify> defers the full round trip (export, clear IndexedDB, reload, reimport, then import a corrupted file) to a <human-check> harvested at end-of-phase; the negative network-API gate and the unit-tested transfer contract underneath it are confirmed above."
  - id: D6
    description: "Root CLAUDE.md has no stale Status section and records app/ and its three npm commands; .claude/CLAUDE.md's Technology Stack, Conventions, and Architecture name app/ and none says its content is pending; the Constraints tech-stack line records ratification; Developer Profile is untouched"
    verification:
      - kind: other
        ref: "grep -c '^## Status' CLAUDE.md = 0; grep -lF 'prefix app' CLAUDE.md .claude/CLAUDE.md = 2 files; direct inspection of .claude/CLAUDE.md during execution — Developer Profile section byte-identical"
        status: pass
    human_judgment: false

duration: 13min
completed: 2026-09-06
status: complete
---

# Phase 1 Plan 4: The Estimated Flag, the Contributor Trace, and the Store Contract Summary

**D-04's dual-placement estimated/unreviewed flag (four ingredient rows, four balance figures), the focus-to-contributors trace across all six figures, a validated whole-store JSON export/import behind the repository seam, and both CLAUDE.md files rewritten to describe the repository as it now is.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-09-06T02:31:00Z
- **Completed:** 2026-09-06T02:44:41Z
- **Tasks:** 3
- **Files modified:** 10 (2 created, 8 modified)

## Accomplishments
- Put the estimated/unreviewed flag in both places D-04 requires: a derived Data column on `IngredientTable` (four rows flagged for the seeded version — whole milk, heavy cream, allulose, fine sea salt) and a basis clause beside PAC, POD, MSNF, and Total solids on `GraduatedRule`, folded into each rule's accessible name; Total fat and Sugar solids print nothing since neither rests on estimated/inherited data (Task 1)
- Wired the brief's signature interaction: `RecipePage` holds the focused figure key, `GraduatedRule` is now a keyboard-focusable control, and `IngredientTable` marks the focused figure's `contributorRowIds` with outline and weight only — verified PAC marks exactly 7 rows, MSNF exactly 3, sugar solids exactly 3, matching the domain module's own contributor sets (Task 2)
- Closed the store contract: `exportStore`, `validateStoreFile`, `importStore` (TDD, 15 new tests) collect every validation error, reject any payload carrying a prototype-mutating own key before any traversal that could act on it, and refuse to write anything on an invalid import; wired Export/Import controls onto the recipe list using only local file reading, no network API anywhere under `app/src` (Task 3)
- Rewrote both CLAUDE.md files with `Edit` (never `Write`): removed the root file's stale "web app has not been started" section, recorded `app/` and its three npm commands in both files, and filled `.claude/CLAUDE.md`'s Technology Stack, Conventions, and Architecture from what actually shipped (Task 3)

## Task Commits

Each task was committed atomically:

1. **Task 1: The estimated flag, in both places D-04 requires** — `acaa317` (feat)
2. **Task 2: Trace a figure to the rows that carry it** — `1483323` (feat)
3. **Task 3: Close the store contract, and record the structure that landed** (TDD)
   - `6fc2165` (test) — failing test for the store transfer contract
   - `d760877` (feat) — implemented the store transfer contract
   - `bb2286e` (feat) — export and import controls on the recipe list
   - `73b1f5d` (docs) — record the repository as it now is

**Plan metadata:** committed separately after this summary.

## Files Created/Modified
- `app/src/ui/IngredientTable.jsx` — new Data column; `weakestRowBasis`/`dataFlagFor` derive each row's flag from its own composition fields; row marking (`markedRowIds`, `markedFigureLabel`) with outline+weight only; explicit row accessible names
- `app/src/ui/GraduatedRule.jsx` — basis clause beside the figure and in its accessible name; refactored to a focusable `<button>` with `onFocus`/`onBlur` reporting the figure key up, inner markup `aria-hidden`
- `app/src/ui/FormulationNote.jsx` — passes `onFocusFigure`/`onBlurFigure` through to each `GraduatedRule`
- `app/src/ui/RecipePage.jsx` — holds `focusedFigureKey`, computes `buildFigures` once, derives `markedRowIds`/`markedFigureLabel` for the focused figure
- `app/src/ui/RecipeList.jsx` — Export button (object URL + anchor download) and Import button (hidden file input, `file.text()`, `importStore`), validation errors rendered as text
- `app/src/store/transfer.js` — `exportStore`, `validateStoreFile`, `importStore`; collect-all-errors validation; prototype-pollution guard via `Object.keys` scanning
- `app/src/store/transfer.test.js` — 15 tests: export shape, round trip, every validation-field case, two-distinct-faults, prototype-mutating-key rejection, no-partial-write
- `app/src/styles/app.css` — `.graduated-rule` button reset and focus outline, `.graduated-rule__basis`, `.ingredient-table tbody tr.is-marked`, `.recipe-list__transfer`/`__file-input`/`__import-errors`
- `CLAUDE.md` — removed `## Status`, added "Where the code lives", one sentence recording ratification in the JSX toolchain section
- `.claude/CLAUDE.md` — filled Technology Stack, Conventions, Architecture; updated the Constraints tech-stack line to "ratified"

## Decisions Made
- The ingredient table's new column is headed "Data" (no name was assigned by the direction contract for this specific column; chosen to match the artifact's own description).
- Row and figure accessible names are built explicitly (not left to default per-cell/per-element reading) so the estimated flag and the contributor trace are provably part of the accessible name, not only the visual rendering.
- `GraduatedRule` became a native `<button>` with one aria-label carrying its full sentence, inner markup `aria-hidden` — the standard pattern for a focusable control whose drawing is decorative relative to its stated fact.
- Hover-as-alternate-trigger for figure focus was not implemented — the plan permits it ("may") but only requires keyboard focus to always work; adding it would need cross-row focus/hover reconciliation the plan doesn't ask for.

## Deviations from Plan

None - plan executed exactly as written.

## TDD Gate Compliance

Task 3's RED (`6fc2165`, `test(01-04)`) precedes its GREEN (`d760877`, `feat(01-04): implement the store transfer contract`) — gate sequence intact. RED failed for the correct reason (`Cannot find module './transfer.js'`, verified before writing the implementation). No REFACTOR commit — the GREEN implementation was already minimal.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 1 is now complete: all four plans have summaries. The recipe read surface — twelve rows, method, authored notes, six balance figures with the basis they rest on, the estimated flag in both placements, the contributor trace, and validated whole-store transfer — is built and verified against `npm --prefix app test` (72 passing) and `npm --prefix app run build`.
- Both CLAUDE.md files now describe `app/` as it exists; the React + Vite + JSX stack is ratified, closing the last provisional item this phase carried.
- `contributorRowIds`, `basis`, and `estimatedRowNames` on the figure descriptor (established in 01-03) proved sufficient for both this plan's row-flag and contributor-trace work — no domain module changes were needed in this plan.
- Deferred to end-of-phase human verification (per `workflow.human_verify_mode=end-of-phase`): the visual legibility of the estimated flag and contributor marking, keyboard tab order across all six figures, pixel-identical row positions across focus changes, and the full export/clear-IndexedDB/reimport round trip in a real browser.

---
*Phase: 01-read-the-churned-recipe*
*Completed: 2026-09-06*

## Self-Check: PASSED

- All key files verified present on disk (`[ -f ]`): `app/src/store/transfer.js`, `app/src/store/transfer.test.js`, and all modified files.
- All 6 commits verified in git log: `acaa317`, `1483323`, `6fc2165`, `d760877`, `bb2286e`, `73b1f5d`.
- Plan-level `<verification>` re-run: `npm --prefix app run build` exits 0 ("built in" line present); `npm --prefix app test` exits 0 with 72 passing tests (≥47 required); the estimated word appears on exactly 4 rows and 4 figures (derived, verified via `renderToStaticMarkup`, not committed); focusing PAC/MSNF/sugar-solids marks exactly 7/3/3 rows (verified via `renderToStaticMarkup`, not committed); no network API call site under `app/src`; root `CLAUDE.md` has no `## Status` section and both CLAUDE.md files contain `npm --prefix app run dev`.
- Acceptance criteria re-verified: no colour literal in `IngredientTable.jsx`/`GraduatedRule.jsx`; none of the four flagged ingredient names appear as literals in `IngredientTable.jsx`; `grep -c "estimatedRowNames" app/src/ui/GraduatedRule.jsx` = 2; Developer Profile section of `.claude/CLAUDE.md` byte-identical to before this plan.
