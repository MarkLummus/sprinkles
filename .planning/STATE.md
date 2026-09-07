---
gsd_state_version: "1.0"
current_phase: 03
current_phase_name: Develop the next version
status: executing
stopped_at: Completed 03-04-PLAN.md
last_updated: "2026-09-07T19:33:33.933Z"
last_activity: 2026-09-07
last_activity_desc: Phase 03 execution started
state_head: 3bc02054023d9d9151f11680bff0ee9bbaf976b8
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 14
  completed_plans: 13
  percent: 25
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-07)

**Core value:** Make something you like, understand how it turned out, and know what to keep or change next time.
**Current focus:** Phase 03 — Develop the next version

## Current Position

Phase: 03 (Develop the next version) — EXECUTING
Plan: 5 of 5
Status: Ready to execute
Last activity: 2026-09-07 — Phase 03 execution started

Progress: [███░░░░░░░] 25% (2/4 phases; 9/9 plans)

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
| Phase 03 P01 | 31min | 3 tasks | 22 files |
| Phase 03 P02 | 20min | 3 tasks | 12 files |
| Phase 03 P03 | 40min | 3 tasks | 11 files |
| Phase 03 P04 | 27min | 2 tasks | 12 files |

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
- [Phase 03]: [Phase 3, Plan 01] The version record's new shape (parentVersionId/parentVersionLabel/reason/citedBatchId/createdAt, per-row/step removed flags, per-step uses lists, per-note inheritedFrom markers) arrived via a one-time IndexedDB upgrade to DB_VERSION 3, proven against a real IndexedDB with fake-indexeddb; the shared liftVersionRecord function is called by both db.js's upgrade and transfer.js's import, never a second ladder.
- [Phase 03]: [Phase 3, Plan 01] liftVersionRecord is applied on import to both schemaVersion 1 and 2 files (not only schemaVersion 2), since the stricter validator requires the new fields regardless of which file version carries an old-shaped record.
- [Phase 03]: [Phase 3, Plan 01] createChildVersion carries schemaVersion forward from the parent rather than importing VERSION_SCHEMA_VERSION into domain/lineage.js, keeping the domain module's no-store-import rule exact.
- [Phase 03]: [Phase 3, Plan 01] Deviation: modified app/src/ui/BatchMargin.jsx (omitted from the plan's files_modified frontmatter) to disable batch-starting controls while developing, per the plan's own action text and D-10's mutual-exclusivity constraint.
- [Phase 03]: [Phase 3, Plan 02] Built one draftVersion per render in RecipePage — the pen's own tables, the two removal cross-flags (uses.js) and buildDiff all read it, replacing the earlier ad hoc liveVersion reconstruction; removal is always a single flag flip (never a cascade), with both cross-flags recomputed live so restoring clears a flag without anything having stored one.
- [Phase 03]: [Phase 3, Plan 02] penDraft.rows changed shape from a bare grams string to { grams, step, removed } per row; buildPenFields validates grams only for rows the draft itself does not mark removed. A removed authored note is deleted outright (no struck-in-place treatment, since notes carry no uses-list cross-flag concern); a note's inheritedFrom marker is recomputed eagerly in the text-change handler by comparing against the original inherited text.
- [Phase 03]: [Phase 3, Plan 03] blockedSaveMessage(penFields, version, versions) takes versions already scoped by the caller (recipe-filtered, self-excluded for a save-over) rather than an excludeId of its own.
- [Phase 03]: [Phase 3, Plan 03] RecipeList.jsx's row rendering is split into an exported RecipeRows presentational component (mirroring VersionStrip.jsx's shape), tested with the repository module stubbed via vi.mock since importing RecipeList.jsx otherwise opens a real IndexedDB at module load.
- [Phase 03]: [Phase 3, Plan 03] A reason of nothing but whitespace is trimmed to null at save time, the same treatment an empty reason already got; the cited batch's churn date is read via one repository.getBatch(citedBatchId) call.
- [Phase 03]: GraduatedRule's figureDelta support is scoped to the show-changes state only, not the pen's own developing mode, matching this plan's own acceptance criteria and human-check text — The brief's focal moment describing it while the pen is open is read as illustrative of the same grammar, not a second tested call site

### Pending Todos

None yet.

### Blockers/Concerns

- Impeccable initialized 2026-09-05: `PRODUCT.md` written; surface brief for the recipe surface and bench sheet confirmed by Mark (`.impeccable/surfaces/`, direction "The Formulation Cookbook" expanding the Cupping Form, seed d1a5d80a, code-led). Phase 1, 3, and 4 prerequisites met. `DESIGN.md` and `.impeccable/design.json` written 2026-09-06 by `/impeccable document` from the Phase 1 build (commit 17bd91f); North Star "The Formulation Cookbook". The batch-capture brief for Phase 2 is confirmed: `.impeccable/surfaces/route-recipe-batch.md`, shaped and confirmed by Mark 2026-09-06 and committed in e23d798, so the Phase 2 prerequisite is met. The Phase 3 brief is confirmed: `.impeccable/surfaces/route-recipe-version.md` ("Developing the next version"), shaped and confirmed by Mark 2026-09-07, so the Phase 3 prerequisite is met.
- [Phase 2 → 3] Security: T-02-32 (medium, non-blocking) is open in `02-SECURITY.md`. `setMark`'s write path at `app/src/domain/axes.js:71` is a plain bracket assignment rather than the own-property-only write the plan committed to; a `__proto__` axis name today drops the mark silently and does not pollute. Close with an own-property-only write or a `__proto__` test, or re-disposition to accept with the numeric-stops rationale.
- [Phase 2 design debt, Impeccable-owned] `Save batch` is hard to find: no button-weight token in the direction contract and the control sits at the foot of the page's longest column (UAT G-02-4 second half, UI review 22/24). The UI review also notes `Amend` and `Record another batch` share identical styling and differ only by label.
- [Phase 3 input] The UI review asks whether a tasting saved with some axes marked and others unmarked is incomplete; the batch brief treats an unmarked axis as a valid silence. Decide in Phase 3 discussion, not in code.
- [Phase 3 input] `.impeccable/surfaces/route-recipe-version.md` leaves five things to the Phase 3 discussion, not to a builder: the label of the control that opens the pen ("Develop the next version" is the working name); whether the show-changes state is URL-addressable; whether a fifth advisory, the batch mass against the machine's minimum fill, joins the four FORM2-02 advisories; the partly marked tasting question in the bullet above; and the store's schema move and what a schemaVersion 2 export does when imported after it.
- [Milestone 2 backlog, Mark 2026-09-07] Held objections from the Phase 3 shaping, recorded rather than dropped: editing target bands; adding a step; adding a row from the seed library (needs REQUIREMENTS.md's twelve-row limit lifted).
- [After Phase 3, Impeccable-owned] Re-run `/impeccable document` so `DESIGN.md` records the pen layer's components from Phases 2 and 3 together (field, strike, marks control, button, hollow tick, show-changes control) and the Strike Rule; `DESIGN.md` still says pen blue is unused on screen and no input exists.
- [Housekeeping] Four `.planning/debug/*.md` sessions (record-a-batch-entry-missing, pen-layer-no-cancel-save-hard-to-find, skipped-label-struck-through, tasting-mark-cannot-be-cleared) still read `status: diagnosed` although their gaps closed in 02-04 and 02-05; mark them resolved.
- [Phase 1 carry] Hover-as-alternate-trigger for figure focus was not built (keyboard only); revisit if a pointer-first review surface needs it.
- [Phase 1 carry] UI audit recommends checking the book-spread grid below 1280px and measuring running-head contrast against AA; UX1-01 verifies end-to-end in Phase 4.
- [Critique 2026-09-06, 23/40] Snapshot `.impeccable/critique/2026-09-06T13-15-16Z__app-src-ui-recipepage-jsx.md`. Grid fixed the same day (formulation note now follows the table; graduated rule capped at its 320px drawing width). Deferred by phase:
  - [Phase 2 carry — done in 02-01] Numeric columns right-aligned and sized to `--col-numeric`; total row added; shares below 0.05% read `trace`.
  - [Phase 3 carry] The recipe page has no link back to the list and "No recipe found" is a dead end; add the running head with the product name as the link home when the version strip lands under the headnote.
  - [Phase 4 carry, UX1-01] Headnote and Margin region names are paragraphs, not headings; the row-level aria-label carrying "contributing to" is unlikely to be announced, so the focus trace is silent to screen readers; the deviation words are not in the rule's accessible name; the ordered method list with list-style needs an explicit list role; the tab title should lead with the recipe name.
  - [Polish carry] Target chips have zero vertical inset and a 2px label-to-value gap that fuses at a glance; adjacent marked-row outlines collide with row rules; the rule has no hover state. (Prose measure fixed 2026-09-06.)
- [Critique 2026-09-06, second run, 25/40] Snapshot `.impeccable/critique/2026-09-06T14-02-09Z__app-src-ui-recipepage-jsx.md`. Spread revised by Mark (note beside the table, method beneath); table shift on focus and the stranded margin fixed the same day. Deferred:
  - [Phase 2 carry — total row and `trace` done in 02-01; rhythm caveat still open] The short-window caveat: at a 714px-tall viewport, focusing Total solids scrolls 487px and only 5 of 12 marked rows stay visible; the six rules stack to ~1000px, so tighten the note's vertical rhythm.
  - [List page carry] `/` has no page margin, default buttons, no title or running head, and a link with no underline or focus treatment; out of the recipe brief's scope, for whichever phase next touches the list.
  - [Phase 4 carry, UX1-01] No live announcement when a rule marks its rows; PAC, POD, MSNF carry no plain-language gloss (D11).
- [Phase 3, Plan 01] Task 1's tracer feedback gate human-check (open the pen, type 48 over 40, watch the strike and six figures move, save, reload) was deferred to end-of-phase UAT per Mark's standing preference (MEMORY.md, Phase 2 Plan 01 precedent). All automated verification (build/test/greps) passed.

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
| 260906-w9g | Impeccable harden: tasting form gets a Cancel, a "Tasting" head, focus on its date when opened and back to "Add a tasting" when closed (critique 2026-09-07 second P1) | 2026-09-06 | 0ad36e8 | [260906-w9g-impeccable-harden-for-the-batch-margin-s](./quick/260906-w9g-impeccable-harden-for-the-batch-margin-s/) |
| 260907-dyn | Commit the confirmed Phase 3 surface brief, revise route-recipe.md § 3 and § 6 to retire the translucent overlay and point at it, and record the confirmed brief in STATE.md | 2026-09-07 | db7214f | [260907-dyn-commit-the-confirmed-phase-3-surface-bri](./quick/260907-dyn-commit-the-confirmed-phase-3-surface-bri/) |

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| *(none)* | | | | |

## Session Continuity

Last session: 2026-09-07T19:33:24.585Z
Stopped at: Completed 03-04-PLAN.md
Resume file: None
