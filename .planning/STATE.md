---
gsd_state_version: "1.0"
current_phase: 3
current_phase_name: Develop the next version
status: planning
stopped_at: Phase 02 complete, ready to plan Phase 3
last_updated: "2026-09-07T02:09:18.409Z"
last_activity: 2026-09-06
last_activity_desc: Phase 02 complete, transitioned to Phase 3
state_head: fc805ad7dc2c954d3fb584439381a90ef1997894
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 9
  completed_plans: 9
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-07)

**Core value:** Make something you like, understand how it turned out, and know what to keep or change next time.
**Current focus:** Phase 3 — Develop the next version

## Current Position

Phase: 3 — Develop the next version
Plan: Not started
Status: Ready to plan
Last activity: 2026-09-06 - Completed quick task 260906-vsn: Impeccable layout fix: churn date into the headnote slot, graduated rules out of the recording tab path, batch brief revised (critique 2026-09-07 P1)

Progress: [█████░░░░░] 50% (2/4 phases; 9/9 plans)

## Performance Metrics

**Velocity:**

- Total plans completed: 9
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 4 | - | - |
| 02 | 5 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 12min | 3 tasks | 20 files |
| Phase 01 P02 | 11min | 3 tasks | 9 files |
| Phase 01 P03 | 5min | 3 tasks | 7 files |
| Phase 01 P04 | 13min | 3 tasks | 10 files |
| Phase 02 P01 | 62 min | 3 tasks | 14 files |
| Phase 02 P02 | 62 min | 3 tasks | 9 files |
| Phase 02 P03 | 68min | 3 tasks | 12 files |
| Phase 02 P04 | 15min | 2 tasks | 3 files |
| Phase 02 P05 | 15min | 2 tasks | 8 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table; product decisions D01–D16 live in `product-requirements/03-decision-register.md` and are accepted.

- Roadmap: Milestone 1 is four vertical slices on the olive oil working case (read → record → develop → print), not technical layers.
- Roadmap: No storage/backend phase — D16 stays open, milestone 1 uses a provisional local store behind a repository seam.
- Roadmap: UX1-01–UX1-03 are verified end-to-end in Phase 4 but are build constraints in every phase.
- [Phase 01]: Version-embedded ingredient row promoted as the primary identity model — a shared library is a future source a version copies from, never a render-time authority.
- [Phase 01]: Reused old-sprinkles library.js/olive-oil.js transcription verbatim (dextrose PAC 190, salt PAC 580) rather than the competing 103-row seed database, per D-01.
- [Phase 01]: Vitest defaults to environment:'node' so the domain suite is provably DOM-free; component tests opt into a DOM environment per-file.
- [Phase 01]: Bookcloth colour chosen as a muted bottle green (#33513B), a third hue distinct from ink and pen blue, used only for plain-language block-name running heads — every block wears its name per the brief's carried raise; bookcloth identifies the book in running heads/section tabs and never carries state, so it needed a hue that could never be mistaken for status.
- [Phase 01]: [Phase 01, Plan 03]: PAC and POD figures list msnf among their contributing fields so the basis they report never under-states the lactose term's dairy MSNF dependency; a figure's basis is the worst basis across all its contributing fields, not just its own.
- [Phase 01]: [Phase 01, Plan 03]: Fixed two arithmetically inconsistent describeDeviation examples in the 01-03 plan's own test spec (value/band pairs that could not produce the stated words) rather than encoding impossible expectations into the test; documented as Rule 1 deviations in the plan's SUMMARY.
- [Phase 01]: The ingredient table's Data column is headed "Data" — no name was assigned by the direction contract for this specific column.
- [Phase 01]: Row and figure accessible names are built explicitly (aria-label) so the estimated flag and contributor trace are provably in the accessible name, not only the visual rendering.
- [Phase 01]: GraduatedRule became a native <button> with one aria-label carrying its full sentence; inner markup is aria-hidden.
- [Phase 01]: Hover-as-alternate-trigger for figure focus was not implemented — the plan only requires keyboard focus; hover was optional and would add cross-row state reconciliation not asked for.
- [Phase 02]: [Phase 2, Plan 01]: Added formatGrams(grams) to domain/composition.js alongside formatShareOfBatch, not in the plan's stated composition.js export list, to satisfy the plan's own gate forbidding a literal toFixed(1) in IngredientTable.jsx for the total row's grams figures (Rule 3 deviation).
- [Phase 02]: [Phase 2, Plan 01]: The tracer feedback gate's human-check (Task 1) and Task 3's human-check were deferred to end-of-phase UAT at the user's explicit request; all automated verification for both was re-run and passes.
- [Phase 02]: [Phase 2, Plan 02] A schemaVersion 1 store file still imports as a store with no batches; a schemaVersion 1 file carrying a non-empty batches array is refused as malformed. Export always writes schemaVersion 2.
- [Phase 02]: [Phase 2, Plan 02] readMeasured and the six churn measurement/note fields on createBatch (Task 2's domain scope) were implemented in Task 1's GREEN commit, since both extend the same churnFields object in one coherent edit; Task 2's domain-level RED tests passed immediately rather than genuinely failing first (documented, not a Rule 1-4 deviation).
- [Phase 02]: [Phase 2, Plan 03] Tasting recording is scoped entirely to an already-saved batch; recordAmendment and addTasting are kept as two distinct domain functions with two distinct UI call sites (never a single patch-shaped updater), and the AxisMark control has no un-mark affordance, matching native grouped radios.
- [Phase 02]: [Phase 2, Plan 03] Extended the beforeunload leave-warning dirty check to cover an in-progress tasting draft (Rule 2 deviation) — D-24's unsaved-ink principle applies to a tasting exactly as it does to the churn draft.
- [Phase 02]: Record another batch is worded distinctly from Amend and sits after the batch list, before the tastings (A-2). — D-06 requires a correction to never read like a new event; the version-scoped control is placed with the version's batches.
- [Phase 02]: Cancel discards immediately with no confirmation dialog (A-1); no button style or layout change was added for it (A-3). — The brief forbids an invented dialog (D-24); button weight and recording-layout findability remain open design decisions for Impeccable.
- [Phase 02]: The strike is scoped to an inner prose span (A-1); a per-axis text Clear control shares the mark control's own onChange, carrying null (A-2); the clear/set rule lives in the domain as setMark, not inline in the page handler (A-3). — G-02-3's label-inside-strike and G-02-6's unremovable mark were both gap-closure fixes against confirmed root causes in .planning/debug/.

- Phase 2: a batch snapshots the version's rows and coefficients once (`structuredClone` in `createBatch`) and never retakes it; `recordAmendment` and `addTasting` are separate functions that never touch the snapshot.
- Phase 2: blank is the absence of a key and a written `0` is a value; a blank measured field reads the word `unknown` and is never filled from the plan.
- Phase 2: tastings are recorded only against an already-saved batch; cancel discards a draft with no dialog of the app's own (D-24), the native leave-warning fires only while a draft is dirty.
- Phase 2: store export writes `schemaVersion` 2; a v1 file imports as a store with no batches, a v1 file carrying batches is refused.
- Phase 2 (02-CONTEXT D-13): method step amounts should be driven by the ingredient table (replacement macros) so amounts and their changes stay in sync; deferred to Phase 3 as a decision input.

### Pending Todos

None yet.

### Blockers/Concerns

- Impeccable initialized 2026-09-05: `PRODUCT.md` written; surface brief for the recipe surface and bench sheet confirmed by Mark (`.impeccable/surfaces/`, direction "The Formulation Cookbook" expanding the Cupping Form, seed d1a5d80a, code-led). Phase 1, 3, and 4 prerequisites met. `DESIGN.md` and `.impeccable/design.json` written 2026-09-06 by `/impeccable document` from the Phase 1 build (commit 17bd91f); North Star "The Formulation Cookbook". The batch-capture brief for Phase 2 is confirmed: `.impeccable/surfaces/route-recipe-batch.md`, shaped and confirmed by Mark 2026-09-06 and committed in e23d798, so the Phase 2 prerequisite is met.
- [Phase 2 → 3] Security: T-02-32 (medium, non-blocking) is open in `02-SECURITY.md`. `setMark`'s write path at `app/src/domain/axes.js:71` is a plain bracket assignment rather than the own-property-only write the plan committed to; a `__proto__` axis name today drops the mark silently and does not pollute. Close with an own-property-only write or a `__proto__` test, or re-disposition to accept with the numeric-stops rationale.
- [Phase 2 design debt, Impeccable-owned] `Save batch` is hard to find: no button-weight token in the direction contract and the control sits at the foot of the page's longest column (UAT G-02-4 second half, UI review 22/24). The UI review also notes `Amend` and `Record another batch` share identical styling and differ only by label.
- [Phase 3 input] The UI review asks whether a tasting saved with some axes marked and others unmarked is incomplete; the batch brief treats an unmarked axis as a valid silence. Decide in Phase 3 discussion, not in code.
- [Housekeeping] Four `.planning/debug/*.md` sessions (record-a-batch-entry-missing, pen-layer-no-cancel-save-hard-to-find, skipped-label-struck-through, tasting-mark-cannot-be-cleared) still read `status: diagnosed` although their gaps closed in 02-04 and 02-05; mark them resolved.
- [Phase 1 carry] Hover-as-alternate-trigger for figure focus was not built (keyboard only); revisit if a pointer-first review surface needs it.
- [Phase 1 carry] UI audit recommends checking the book-spread grid below 1280px and measuring running-head contrast against AA; UX1-01 verifies end-to-end in Phase 4.
- [Critique 2026-09-06, 23/40] Snapshot `.impeccable/critique/2026-09-06T13-15-16Z__app-src-ui-recipepage-jsx.md`. Grid fixed the same day (formulation note now follows the table; graduated rule capped at its 320px drawing width). Deferred by phase:
  - [Phase 2 carry — done in 02-01] Numeric columns right-aligned and sized to `--col-numeric`; total row added; shares below 0.05% read `trace`.
  - [Phase 3 carry] The recipe page has no link back to the list and "No recipe found" is a dead end; add the running head with the product name as the link home when the version strip lands under the headnote.
  - [Phase 4 carry, UX1-01] Headnote and Margin region names are paragraphs, not headings; the row-level aria-label carrying "contributing to" is unlikely to be announced, so the focus trace is silent to screen readers; the deviation words are not in the rule's accessible name; the ordered method list with list-style none needs an explicit list role; the tab title should lead with the recipe name.
  - [Polish carry] Target chips have zero vertical inset and a 2px label-to-value gap that fuses at a glance; adjacent marked-row outlines collide with row rules; the rule has no hover state. (Prose measure fixed 2026-09-06.)
- [Critique 2026-09-06, second run, 25/40] Snapshot `.impeccable/critique/2026-09-06T14-02-09Z__app-src-ui-recipepage-jsx.md`. Spread revised by Mark (note beside the table, method beneath); table shift on focus and the stranded margin fixed the same day. Deferred:
  - [Phase 2 carry — total row and `trace` done in 02-01; rhythm caveat still open] The short-window caveat: at a 714px-tall viewport, focusing Total solids scrolls 487px and only 5 of 12 marked rows stay visible; the six rules stack to ~1000px, so tighten the note's vertical rhythm.
  - [List page carry] `/` has no page margin, default buttons, no title or running head, and a link with no underline or focus treatment; out of the recipe brief's scope, for whichever phase next touches the list.
  - [Phase 4 carry, UX1-01] No live announcement when a rule marks its rows; PAC, POD, MSNF carry no plain-language gloss (D11).

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260906-chn | Commit the two design files written by /impeccable document: DESIGN.md and .impeccable/design.json | 2026-09-06 | 17bd91f | [260906-chn-commit-the-two-design-files-written-by-i](./quick/260906-chn-commit-the-two-design-files-written-by-i/) |
| 2 | Fix the stale "No DESIGN.md yet" line in STATE.md Blockers/Concerns | 2026-09-06 | ea4a14d | — |
| 3 | Fix the recipe page grid (note follows table) and cap the graduated rule width; record critique carries | 2026-09-06 | dcec0d3 | — |
| 4 | Recipe page grid: note beside the table, method beneath; prose measure capped at 65ch | 2026-09-06 | 5671c72 | — |
| 5 | Record the revised recipe spread in the surface brief and DESIGN.md | 2026-09-06 | d99ec8d | — |
| 6 | Recipe page: fixed table layout and column-two wrapper; second critique carries | 2026-09-06 | a413362 | — |
| 7 | Recipe table: fixed leading and wider name column so marked rows never move the method | 2026-09-06 | a6db02e | — |
| 260906-gh9 | Record the confirmed batch-capture brief in STATE.md and move the outcome-dimensions decision in PRODUCT.md from undecided to decided | 2026-09-06 | 18cdcbb | [260906-gh9-record-the-confirmed-batch-capture-brief](./quick/260906-gh9-record-the-confirmed-batch-capture-brief/) |
| 260906-vsn | Impeccable layout fix: churn date into the headnote slot, graduated rules out of the recording tab path, batch brief revised (critique 2026-09-07 P1) | 2026-09-06 | 681e239 | [260906-vsn-impeccable-layout-fix-for-the-batch-reco](./quick/260906-vsn-impeccable-layout-fix-for-the-batch-reco/) |

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| *(none)* | | | | |

## Session Continuity

Last session: 2026-09-07T02:10:18Z
Stopped at: Phase 02 complete, ready to plan Phase 3
Resume file: None
