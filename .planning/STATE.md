---
gsd_state_version: "1.0"
current_phase: 4
current_phase_name: Prepare the next version for making
status: planning
stopped_at: Phase 03.3 complete, ready to plan Phase 4
last_updated: "2026-09-11T00:40:52.748Z"
last_activity: 2026-09-10
last_activity_desc: Phase 03.3 complete, transitioned to Phase 4
state_head: 1f3668c345e40c29db20b4e441fe97ff49db2d6f
progress:
  total_phases: 7
  completed_phases: 2
  total_plans: 38
  completed_plans: 38
  percent: 29
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-10)

**Core value:** Make something you like, understand how it turned out, and know what to keep or change next time.
**Current focus:** Phase 03.3 — The front-matter rows and the page in step order (INSERTED)

## Current Position

Phase: 4 — Prepare the next version for making
Plan: Not started
Status: Ready to plan
Last activity: 2026-09-10 — Phase 03.3 complete, transitioned to Phase 4

Progress: [███░░░░░░░] 29% (3/4 phases; 21/21 plans)

## Performance Metrics

**Velocity:**

- Total plans completed: 38
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 4 | - | - |
| 02 | 5 | - | - |
| 03 | 12 | - | - |
| 03.1 | 5 | - | - |
| 03.2 | 5 | - | - |
| 03.3 | 7 | - | - |

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
| Phase 03 P05 | 31min | 2 tasks | 6 files |
| Phase 03 P06 | 20min | 3 tasks | 8 files |
| Phase 03 P09 | 35min | 3 tasks | 6 files |
| Phase 03 P07 | 25min | 2 tasks | 8 files |
| Phase 03 P08 | 10min | 2 tasks | 4 files |
| Phase 03 P10 | 30min | 3 tasks | 9 files |
| Phase 03 P11 | 20min | 2 tasks | 3 files |
| Phase 03 P12 | ~20min | 2 tasks | 5 files |
| Phase 03.1 P01 | ~35min | 2 tasks | 12 files |
| Phase 03.1 P02 | 27min | 3 tasks | 13 files |
| Phase 03.1 P03 | ~25min | 3 tasks | 7 files |
| Phase 03.1 P04 | 30min | 3 tasks | 11 files |
| Phase 03.2 P02 | 25min | 2 tasks | 4 files |
| Phase 03.2 P03 | 55min | 3 tasks | 10 files |
| Phase 03.2 P04 | 15min | 3 tasks | 12 files |
| Phase 03.2 P05 | 20min | 2 tasks | 2 files |
| Phase 03.3 P02 | 21min | 3 tasks | 8 files |
| Phase 03.3 P03 | 25min | 3 tasks | 6 files |
| Phase 03.3 P04 | 15min | 4 tasks | 18 files |
| Phase 03.3 P05 | 5min | 2 tasks | 1 files |
| Phase 03.3 P06 | ~1h54m elapsed (~15min automated) | 3 tasks | 10 files |
| Phase 03.3 P07 | ~1h58m | 3 tasks | 6 files |

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
- [Phase 03]: [Phase 3, Plan 05] Task 1's domain module and its test file landed in one test(03-05) commit rather than separate RED/GREEN/REFACTOR commits, matching this phase's own precedent (03-01/03-02) for a new pure domain module under tdd="true" — MVP mode is active (workflow.tdd_mode: false), so the strict per-phase TDD gate does not apply.
- [Phase 03]: [Phase 3, Plan 05] DerivedAdvisories reads RecipePage's existing liveVersion rather than a new variable, since it already implements the required pen's-draft-while-open/readingVersion-otherwise semantics; no new --size-advisory token was added since --size-small-print already carries the block's size.
- [Phase 03]: [Phase 3, Plan 06] One derivation (derivePenState) replaces the two hand-rolled pen states; a route-keyed RecipePage backstop, not a reset effect, so pen state cannot cross a version/batch change — Closes G-03-9's RC1, RC2 and the state-preservation half of RC3, plus the fifth leak (Develop excluded silently, with no reason in words); RC4 and the in-app navigation policy remain for 03-07
- [Phase 03]: [Phase 3, Plan 09] buildStepDiff's per-field change flags (leadInChanged/instructionChanged/purposeChanged/asideChanged) replace the forced strike-on-removed device; an absent purpose/aside and an empty-string one compare equal on both sides. uses.js's coveredRowsFor partitions a removed step's rows with orphanedRows (unchanged), and the coverage cue reads its step numbers through one stepDisplayNumber function for 03-10 to thread through.
- [Phase 03]: [Phase 3, Plan 07] The strip, batch list, and lineage links suppress their Link elements (rendering the same label as text plus a pen-hint reason) while any pen is open, closing G-03-9's RC3 navigation-policy half; isPenDraftDirty extended to method/headnote/authored and isDraftDirty gained an optional baseline argument compared against handleStartAmending's own pre-fill instead of blank, closing RC4.
- [Phase 03]: [Phase 3, Plan 08] Sized the ingredient table's Step, As made, and % of batch columns by a per-column class (ingredient-table__col-*) rather than nth-child position, before making the As made column conditional -- so the middle column's removal on a batchless version can never shift widths onto the wrong neighbour.
- [Phase 03]: [Phase 3, Plan 08] Introduced --col-step (66px) derived from the same 1280px-viewport arithmetic the debug session used, chosen so today's rendered layout is unchanged by the column-identity refactor alone; the As made column's conditional removal (task 2) is what actually returns width to its neighbours.
- [Phase 03]: [Phase 3, Plan 10] One derived stepNumbers.js module (displayNumbers/displayNumberOf) threaded through Method.jsx and IngredientTable.jsx as two page-level maps (current, baseline), closing G-03-6 and G-03-3 S3 without renumbering any stored step key.
- [Phase 03]: [Phase 3, Plan 11] Ingredient-table cells made border-box with a new --table-cell-pad-x token (6px, half the old 12px); tokens.css derivation rewritten to add cell padding to each declared width instead of subtracting it from the remainder; --col-data and --col-remove tokens added and --col-ingredient retired in favor of width:auto on the name column (D-UAT-6, closes G-03-11).
- Phase 3 UAT (Mark, 2026-09-07/08): D-UAT-1/2 writing a tasting is a pen and every opener, strip link, batch link and lineage link disables with its reason in words, no dialog; D-UAT-3 the orphaned-row rule stays and a removed step names in words which rows another step still covers; D-UAT-4/5 `n` is immutable identity, live steps renumber, a removed step's number is empty in the pen and struck in show-changes; D-UAT-6 padding-inclusive column tokens, Data and Remove sized, name column absorbs and may wrap below ~1140px. As made column shown only with a batch in view; saved children naming a removed step are remapped on read.
- [Phase 03]: [Phase 3, Plan 12] The pen suppresses a removed step's margin number entirely (D-UAT-5); show-changes marks it struck via a new .method-step__n--struck rule reading --rule-strike (D-UAT-4). The step selector's option and the orphaned-row flag both drop a removed step's number outright, naming it by lead-in alone — closing G-03-14's collision between a removed step's number and the live step that inherited its position.
- [Impeccable 2026-09-08] The three surface briefs (`route-recipe.md`, `route-recipe-version.md`, `route-recipe-batch.md`) were revised 2026-09-08 after the whole-page critique (25/40, `.impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md`) and confirmed by Mark 2026-09-08. Headline decisions: **the imprint** — a front-matter band beside the headnote that takes every control out of the printed spread (openers, version strip, lineage line and show-changes toggle, churned date, batch list, and each pen's save ceremony), with the pen's save/cancel pair repeated at the foot of the page; **the binder** — every control drawn in ink at hairline weight, no fill, no radius, no icon, a disabled control keeping its label and going from solid stroke to dashed with its reason in words, a pressed or current state as outline plus weight; **the pen keeps the page** — prose fields render as printed paragraphs with the hairline outline appearing only on focus, a step's purpose and aside appear on demand behind "add a purpose"/"add an aside", and the uses list reads as one line of names with a "change" control that opens the twelve checkboxes for that step alone; **native date inputs** kept for their validation and keyboard entry with the calendar icon hidden, the browser's segment highlight a named exception to the four-colour system; **Escape** closes only an untouched pen, returning focus to its opener, and does nothing once the draft holds ink, so Cancel is the one exit.
- [Impeccable 2026-09-08] `.claude/CLAUDE.md` gains an "Impeccable and GSD in sync" constraint: Impeccable evaluates and decides (writing `.impeccable/`, `DESIGN.md`, `PRODUCT.md`), every edit under the app workspace goes through a GSD command, and Impeccable's refine, enhance and fix commands describe work for `/gsd-quick`, `/gsd-quick-batch` or a phase plan rather than editing the workspace directly.
- [Phase 03.1]: [Phase 03.1, Plan 01] Versions.jsx and PenFoot.jsx built as the imprint's tracer: Develop opens the plan's pen in Versions (replacing the openers), the ceremony's Cancel/Save pair repeats at a new foot band under a hairline rule, and Headnote.jsx shrinks to the recipe alone. Existing markup moved into Versions kept its pre-existing class names per the plan's own recorded decision; PenFoot gates strictly on openPen === 'plan' (not !== null) since this plan gives it no batch-pen handlers or penDraft — a literal !== null gate would crash on Save during a batch pen.
- [Phase 03.1]: [Phase 03.1, Plan 01] Running heads renamed: Ingredient table -> Ingredients, Formulation note -> Balance, Margin -> Notes (now an h2, was a paragraph). Heading outline: h1 recipe name, h2 Versions, Ingredients, Balance, Method, Notes (D-01, D-02, D-28).
- [Phase 03.1]: [Phase 03.1, Plan 02] Versions.jsx completed for reading state (version list, labelled lineage, always-a-list batch list) and all four pens' ceremonies (plan, record, amend, tasting) with a shared penSaveDisabled/penHint save-gate derivation; BatchMargin.jsx renders no control of any kind; PenFoot covers all four pens from the same shared gate.
- [Phase 03.1]: [Phase 03.1, Plan 02] The keyboard contract: one document keydown listener for Escape, gated on each pen's own existing dirty check (isPenDraftDirty/isDraftDirty/isTastingDraftDirty); a fork's save carries router-state ({ state: { focusDevelop: true } }) so the child's Develop control gets autoFocus on mount. The tasting date field now renders twice (ceremony + margin content, both bound to the same draft) per the plan's own literal deletion scope — flagged for the re-critique.
- [Phase 03.1]: [Phase 03.1, Plan 03] The binder built as global element rules (button, select, :focus-visible, checkbox, date/number input, textarea, a) in app.css, every value through a token; the outline split repoints --focus-outline-width to --rule-baseline (1.5px) and the four state sites to --rule-graduation (1px) explicitly, retiring three bespoke :focus rules for one global :focus-visible rule.
- [Phase 03.1]: [Phase 03.1, Plan 03] select.ink-field needs its own chevron background, not just its own padding: .ink-field's class-level background:none outranks a bare select rule regardless of source order, which would have silently blanked the chevron on the app's only two real selects. Fixed by drawing the chevron on a combined select, select.ink-field selector, keeping exactly two linear-gradient() calls in the file.
- [Phase 03.1]: Plan 04: shared useOnDemandField hook (Method.jsx) implements the collapse-on-blur mechanism once for purpose, aside, and the batch pen's per-step line; per-step pen rendering extracted into StepPenBody/StepRecordingControls so each step owns genuine component-local useState. — Avoids reimplementing the same open/collapse-on-blur logic three times and avoids calling hooks inside a bare .map() callback.
- [Phase 03.2]: [Phase 03.2] transfer.js narrows to schemaVersion 4 alone; validateRow gates a row on its portions array, validateBatch validates each declaredAxes element shape (D-07a); importStore lost its lift branch entirely.
- [Phase 03.2]: [Phase 03.2, Plan 02] versionLift.js deleted along with its last consumer (lineage.test.js's liftVersionRecord idempotence block); the round trip through exportStore/importStore is proven against the real seeded olive oil version and its 2 Aug batch, serialised through JSON.parse(JSON.stringify(...)).
- [Phase 03.2]: [Phase 03.2, Plan 03] IngredientTable.jsx and RecipePage.jsx read row.portions in all three states; the pen renders one amount field per portion with distinct accessible names on a split row, and the step selector still chooses only the first portion's step.
- [Phase 03.2]: Phase 3.2: as-made moves to a per-portion array (churn.asMade[rowId] aligned with row.portions), BATCH_SCHEMA_VERSION 1->2; AsMadeCell/handleChangeAsMade/handleSaveBatch carry a portionIndex end to end; the phase closes with three regression guards (six independent axes, the derived-total invariant, a reseeded batch read out of a real IndexedDB) at a reconciled 673 tests.
- [Phase 03.2]: No shared helper for the two IngredientTable.jsx join sites — the As-made column filters an unwritten portion out (D-10), the pen substitutes the stored amount in (D-01); one helper would carry one rule for two different meanings.
- [Phase 03.2]: The all-blank-portions test assertion was scoped to the row's own tbody markup rather than the whole table, since the total row legitimately carries its own 'as made X grams' phrase whenever an as-made layer is showing at all.
- [Phase 03.3]: [Phase 03.3, Plan 02] Kept rowAccessibleLabel's grams/share phrase row-level (the row's own stored total) while making asMadeValue portion-scoped, since the sub-line makes the row total visible on every portion-tr but no row-level joined as-made summary exists anywhere in the new design.
- [Phase 03.3]: [Phase 03.3, Plan 02] formatPortionLine's rowTotalGrams argument stays rowGrams(row) (the stored/baseline total) across reading, pen, and show-changes; only portionGrams and mass vary by branch.
- [Phase 03.3]: [Phase 03.3, Plan 03] Followed Mark's 2026-09-10 option-B resolution: the removed-row cross-flag moves inside the edit-this-step reveal with the rest of the form; the coverage cue (plain prose, no control) stays on the closed step.
- [Phase 03.3]: [Phase 03.3, Plan 03] Rewrote Method.test.jsx assertions invalidated by StepPenBody's closed-by-default rewrite to test the new closed markup, following the file's own established "UAT item, not asserted here" precedent, rather than adding jsdom/testing-library to simulate the reveal click.
- [Phase 03.3]: [Phase 03.3, Plan 04] Kept 'From version' (not the sketch's bare 'From') for the lineage's Parent-line rename, per Mark's 2026-09-10 resolution: it pairs with 'From batch' so the two lineage labels read as parallel.
- [Phase 03.3]: [Phase 03.3, Plan 04] figures.js's figure label became a structured { word, term } pair (D11), flattened everywhere else through one new figureLabelText function — GraduatedRule.jsx renders it as two sibling spans, never an HTML string.
- [Phase 03.3]: [Phase 03.3, Plan 05] Closed G-03.3-2: the uses checklist's Escape handler moved off the fieldset alone onto a wrapper div covering the change/done button and the fieldset, gated on usesOpen so a closed checklist's Escape no-ops and bubbles unchanged to the pen's own document-level listener; confirmed live by Mark 2026-09-10.
- [Phase 03.3]: [Phase 03.3, Plan 06] Closed G-03.3-1 (fork landing focus via explicit useEffect, not autoFocus) and the version-row half of G-03.3-4 (right-hand stack, acts group, and pen fields match sketch 003 variant B); the pen's From batch absence text reads "no batch" in the ordinary field face after a CSS selector was scoped to the label span alone (:first-child), per Mark's live review of 0a416f0.
- [Phase 03.3]: [Phase 03.3, Plan 06] Deferred to Impeccable: how a maker expresses "edit this version" versus "fork this version" — the opener and save nomenclature (Next version / Cancel-Save as-Save) is unresolved as of 2026-09-10; not touched by this plan.
- [Phase 03.3]: [Phase 03.3, Plan 07] Declined to invent a new "Oil bottle open" stored batch field, per the plan's own reversibility note; deferred to Impeccable.
- [Phase 03.3]: [Phase 03.3, Plan 07] Closed G-03.3-3 (one "no batch yet" line) and the batch-row half of G-03.3-4 (head line, measured cells, tasting, foot controls match sketch 003 variant B); two checkpoint-feedback fixes (record-pen field sizing, churn-date/foot relocation) applied live during Task 3, confirmed by Mark 2026-09-10.

### Pending Todos

None yet.

### Blockers/Concerns

- Impeccable initialized 2026-09-05: `PRODUCT.md` written; surface brief for the recipe surface and bench sheet confirmed by Mark (`.impeccable/surfaces/`, direction "The Formulation Cookbook" expanding the Cupping Form, seed d1a5d80a, code-led). Phase 1, 3, and 4 prerequisites met. `DESIGN.md` and `.impeccable/design.json` written 2026-09-06 by `/impeccable document` from the Phase 1 build (commit 17bd91f); North Star "The Formulation Cookbook". The batch-capture brief for Phase 2 is confirmed: `.impeccable/surfaces/route-recipe-batch.md`, shaped and confirmed by Mark 2026-09-06 and committed in e23d798, so the Phase 2 prerequisite is met. The Phase 3 brief is confirmed: `.impeccable/surfaces/route-recipe-version.md` ("Developing the next version"), shaped and confirmed by Mark 2026-09-07, so the Phase 3 prerequisite is met.
- [Phase 3 → 4] Security: T-03-10 (medium, non-blocking) is open in `03-SECURITY.md`. The pen draft's seeding path at `app/src/ui/RecipePage.jsx:719` (`rows[row.id] = {...}` in `handleStartDeveloping`) is a bare bracket write against a stored row id; an imported `{"id": "__proto__"}` passes the transfer validator and corrupts the local draft object (not `Object.prototype`). Close with `Object.fromEntries` or re-disposition to accept with the local-only rationale. T-02-32 is closed by T-03-06.
- [Phase 3 → 4] Code review WR-01 (skipped, needs a browser): measure the rendered width of the Data column's flag word `unreviewed` at 1024–1440 against `--col-data`'s 74px content width (`tokens.css:114-117`) and adjust the token or confirm the estimate as measured.
- [Phase 3 → 4] `inheritedFrom` on authored notes is rendered, preserved-or-cleared and carried to the child, but nothing yet originates it (seed notes are null); a child developed from the seed shows no provenance. Backlog for whichever phase next touches notes (03-SECURITY.md observation 1).
- [Phase 3 UAT notes, cosmetic] In show-changes the Total row's grams value wraps to two lines (UAT test 17). Deferred follow-ups from UAT test 2: a slug-based child URL from the version line; a pure version view when a version has batches (today the newest batch is always in view), possibly a tree of versions with batches beneath.
- [Phase 2 design debt, Impeccable-owned] `Save batch` is hard to find: no button-weight token in the direction contract and the control sits at the foot of the page's longest column (UAT G-02-4 second half, UI review 22/24). The UI review also notes `Amend` and `Record another batch` share identical styling and differ only by label.
- [Milestone 2 backlog, Mark 2026-09-07] Held objections from the Phase 3 shaping, recorded rather than dropped: editing target bands; adding a step; adding a row from the seed library (needs REQUIREMENTS.md's twelve-row limit lifted).
- [After Phase 3, Impeccable-owned] Re-run `/impeccable document` so `DESIGN.md` records the pen layer's components from Phases 2 and 3 together (field, strike, marks control, button, hollow tick, show-changes control) and the Strike Rule; `DESIGN.md` still says pen blue is unused on screen and no input exists.
- [Housekeeping] Four `.planning/debug/*.md` sessions (record-a-batch-entry-missing, pen-layer-no-cancel-save-hard-to-find, skipped-label-struck-through, tasting-mark-cannot-be-cleared) still read `status: diagnosed` although their gaps closed in 02-04 and 02-05; mark them resolved.
- [Phase 1 carry] Hover-as-alternate-trigger for figure focus was not built (keyboard only); revisit if a pointer-first review surface needs it.
- [Phase 1 carry] UI audit recommends checking the book-spread grid below 1280px and measuring running-head contrast against AA; UX1-01 verifies end-to-end in Phase 4.
- [Critique 2026-09-06, 23/40] Snapshot `.impeccable/critique/2026-09-06T13-15-16Z__app-src-ui-recipepage-jsx.md`. Grid fixed the same day (formulation note now follows the table; graduated rule capped at its 320px drawing width). Deferred by phase:
  - [Phase 2 carry — done in 02-01] Numeric columns right-aligned and sized to `--col-numeric`; total row added; shares below 0.05% read `trace`.
  - [Phase 4 carry, UX1-01] Headnote and Margin region names are paragraphs, not headings; the row-level aria-label carrying "contributing to" is unlikely to be announced, so the focus trace is silent to screen readers; the deviation words are not in the rule's accessible name; the ordered method list with list-style needs an explicit list role; the tab title should lead with the recipe name.
  - [Polish carry] Target chips have zero vertical inset and a 2px label-to-value gap that fuses at a glance; adjacent marked-row outlines collide with row rules; the rule has no hover state. (Prose measure fixed 2026-09-06.)
- [Critique 2026-09-06, second run, 25/40] Snapshot `.impeccable/critique/2026-09-06T14-02-09Z__app-src-ui-recipepage-jsx.md`. Spread revised by Mark (note beside the table, method beneath); table shift on focus and the stranded margin fixed the same day. Deferred:
  - [Phase 2 carry — total row and `trace` done in 02-01; rhythm caveat still open] The short-window caveat: at a 714px-tall viewport, focusing Total solids scrolls 487px and only 5 of 12 marked rows stay visible; the six rules stack to ~1000px, so tighten the note's vertical rhythm.
  - [List page carry] `/` has no page margin, default buttons, no title or running head, and a link with no underline or focus treatment; out of the recipe brief's scope, for whichever phase next touches the list.
  - [Phase 4 carry, UX1-01] No live announcement when a rule marks its rows; PAC, POD, MSNF carry no plain-language gloss (D11).
- [Impeccable 2026-09-08 -> new phase between 3 and 4] The code work for these confirmed revisions is to be planned as a phase inserted between Phase 3 and Phase 4, not as quick tasks: the imprint (front-matter band, every control out of the spread, the save pair repeated at the foot), the binder's control treatment and its new `--focus-outline-width` token, the pen's printed-paragraph prose fields with purpose and aside on demand and the uses line, native date inputs with the calendar icon hidden, and Escape closing only an untouched pen. Briefs: `.impeccable/surfaces/route-recipe.md` (§ 3 the imprint, § 6 the binder and § 8 Controls), `route-recipe-version.md`, `route-recipe-batch.md`; critique snapshot `.impeccable/critique/2026-09-08T12-33-31Z__app-src-ui-recipepage-jsx.md` (25/40, three P1s).

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
| 260908-eil | Record the 2026-09-08 Impeccable revisions | 2026-09-08 | 03104fd | [260908-eil-record-the-2026-09-08-impeccable-revisio](./quick/260908-eil-record-the-2026-09-08-impeccable-revisio/) |
| 13 | Ignore GSD phase-researcher web cache (.planning/research/.cache/) in .gitignore | 2026-09-08 | f1c33be | — |
| 260909-oov | Stop the on-demand method field stealing focus on mount | 2026-09-09 | 7f50ae9 | .planning/quick/260909-oov-stop-the-on-demand-method-field-stealing |
| 260909-oow | Make the live balance figures accept exactly the grams the save accepts, and stop bad as-made grams reaching the store | 2026-09-09 | be86eb5 | .planning/quick/260909-oow-make-the-live-balance-figures-accept-exa |
| 260909-oox | Reject impossible negative measured values on the batch record | 2026-09-09 | 66d0849 | .planning/quick/260909-oox-reject-impossible-negative-measured-valu |

### Roadmap Evolution

- Phase 03.1 inserted after Phase 3: The imprint and the binder — the 2026-09-08 Impeccable brief revisions: front-matter band, controls out of the spread, the pen reads as the page, the binder's control treatment, rules strike the parent figure, columns hold in every state (URGENT)
- Phase 03.2 inserted after Phase 03.1: The portion and the lift — route-recipe.md revised twice on 2026-09-09; re-cut 2026-09-09 as the stored-shape half, the page rebuild moving to 03.3 (URGENT)
- Phase 03.3 inserted after Phase 03.2: The front-matter rows and the page in step order — split out of the original 03.2 so the stored-shape migration is verified on its own (URGENT)

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| *(none)* | | | | |

## Session Continuity

Last session: 2026-09-12 (sketch 007)
Stopped at: Three design questions settled with Mark and applied to sketch 007 (axes-split rule, blanked demo values, hidden-until-added primary); checkpoint at `.planning/sketches/.continue-here.md`
Resume file: `.planning/sketches/.continue-here.md`
