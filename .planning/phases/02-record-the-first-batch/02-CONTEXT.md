# Phase 2: Record the first batch - Context

**Gathered:** 2026-09-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers the batch record for the churned olive oil version: the recipe page's pen layer (an as-made column, a strike and a changed line per method step, and a batch-log block in the margin), a batch stored as its own record that references the version and snapshots the version's rows and coefficients on first save, the saved batch's reading state reachable by URL, tastings added after the churn, and dated amendments. The working case is the 2 Aug 2026 batch, transcribed by hand from the annotated sheet. Requirements BATCH1-01, BATCH1-02, BATCH2-01, BATCH2-02, OBS1-01, with UX1-01 as a build constraint. Success criteria are in `.planning/ROADMAP.md` Phase 2.

Not in this phase: creating or editing versions and comparison (Phase 3), printing and the printed batch-log page's geometry (Phase 4), the ingredient library, draft persistence across reload (UX1-02, Phase 4), as-made figures on the graduated rules, comparison across batches, diagnosis, any parsing or model call, phone design and testing, a rating control or overall score (D12).

</domain>

<decisions>
## Implementation Decisions

### The record's shape: a churn event and its tastings
- **D-01:** A batch is one churn event plus zero or more tastings. The churn event owns the churn date, the as-made amounts per row, the per-step strikes and changed lines, come-up time, draw temperature, overrun, and draw notes. A tasting owns its own date, the tasting temperature, the marks on the core and declared axes, the meltdown loss, the words, and the next-time note. The sheet folded both into one undated log page; Mark named that a design bug. — **Reversibility:** costly — the batch record's shape is what the export file, the Phase 3 change reason, and the Phase 4 printed log page all read; collapsing tastings back into the batch later means migrating every stored batch and reprinting the log page.
- **D-02:** A tasting saves with at least one of words or marks; nothing else is required. OBS1-01 is read as "no required field beyond the words when words are given". The 2 Aug tasting is transcribed as it stands, marks only.
- **D-03:** A tasting's date may be absent and then reads "date unknown" in ink. Tastings are ordered by date with undated ones last. The 2 Aug tasting has no date on the sheet and is recorded without one.
- **D-04:** A next-time note, labelled as intention, can be written on the churn section and on each tasting; it is not exclusive to tastings (Mark, 2026-09-06, revising the brief). Phase 3's change reason cites the batch and reads the latest.
- **D-05:** "Not yet evaluated" means the batch has no tasting yet; the margin says so in ink and offers to add one. The shortcut "as expected, nothing to note" stays, as one control beside the tasting's words that writes those words.
- **D-06:** Amendments are recorded as `recordedAt` plus a list of amendment dates on the batch; the page shows the latest beside the churn date. Prior field values are not kept. Adding a tasting is a new dated tasting, never an amendment. The snapshot is never retaken (brief, BATCH2-01, D04).
- **D-07:** Tasting temperature is recorded per tasting as a measured field, never taken from the version's serve target. Blank reads unknown like every other measured field (BATCH1-02).
- **D-08:** Meltdown belongs to the tasting event, on the old batch brief's evidence that it is measured on the from-freezer occasion. Entered as one field, the loss in grams at 20 min; the 54 and 51 are not kept.
- **D-09:** One optional free-text "ingredient notes" line on the batch holds facts like the oil bottle's open date (24 Jul) and cream butterfat, untyped, so nothing on the sheet is homeless. They are not typed batch fields.

### The 2 Aug working case, confirmed
- **D-10:** The transcription in the brief and PROJECT.md is confirmed with these corrections. Step 9's annotation reads "Speed Δ @ 20 min", meaning the machine speed was changed at 20 minutes, not a setting called "Speed A"; the brief carries the wrong reading and needs correcting. "Fast, Soft, Prechill 15 min" are Whynter machine settings and stay in the step's changed line in the maker's words. Everything else stands: churn 2 Aug 2026; whole milk 370.4 → 383 (120 + 263); heavy cream 252.8 → 241; olive oil 40 → 45; step 8's blend 45 s → 60 s; come-up 20 min; draw −6 °C; overrun not measured; draw notes "Soft, not greasy"; tasting at −12 °C; oil character 4.5, bitterness 5, sweetness 4; meltdown loss 3 g at 20 min.
- **D-11:** The lecithin was skipped: no lecithin was used. The lecithin row's as-made is 0 g and step 1 is struck. Consequence: 0 is a real as-made value, distinct from blank, which means "not written" and is stored as absent.
- **D-12:** "Actually 45 g" was captured during the churn and is not an amendment. The whole sheet is one original recording; amend is exercised in UAT by a deliberate later edit.
- **D-13:** Step 3 stays unmarked in the 2 Aug record; the as-made column alone carries 383 and 241. Mark's direction is that method step amounts should be driven by the ingredient table (replacement macros) so amounts and their changes stay in sync; that mechanism is deferred to Phase 3 and recorded there as a decision input.

### Marks and measures
- **D-14:** Each axis is 1–5 with half steps, with behavioural anchor words at the ends, never adjectival. The four core axes take the earlier attempt's anchors: hardness "spoon sinks … spoon won't enter", scoopability "crumbles … rolls clean", smoothness "grainy … no crystal felt", sweetness "flat … dominant" (old-sprinkles `CORE_AXES`). The signed scale centred on "Good" is rejected. No overall rating (D12).
- **D-15:** Declared axes carry anchors authored on the version: `declaredAxes` becomes a list of `{ name, low, high }`. The seed's two are olive oil character "can't find it … tastes of oil first" and bitterness "none … catches the throat". — **Reversibility:** costly — changes the seeded version record's shape that Phase 3 editing and the export validator read.
- **D-16:** A mark is entered as a nine-stop labelled keyboard group (1, 1.5, … 5) with the anchors at the ends; arrow keys move a half step, one click sets. A half step is a value, not a rounding. Any axis may stay unmarked.
- **D-17:** Overrun is a typed percentage, one field. Come-up is a plain number of minutes; the sheet's "~" is not stored (draw notes can say "about").
- **D-18:** Precision: come-up in whole minutes; draw and tasting temperature in °C to a half degree with a leading sign; overrun in whole percent; meltdown loss in whole grams. Anything typed finer is kept as typed, never rounded; the display shows what was entered. Every measured field is a plain number or absent.

### Batch identity, URL, and the store
- **D-19:** A saved batch's URL is `/recipe/:id/batch/:batchId`, nested under the version it was made against; the page is the same recipe page with that batch's layer showing. No route for the recording state itself (brief § 6).
- **D-20:** A batch has an opaque generated id (`crypto.randomUUID()`); the churn date is its label in the margin list and in any link text. Two batches on one day cannot collide. — **Reversibility:** costly — Phase 3's change reason cites batch ids; a scheme change later means rewriting stored citations.
- **D-21:** The version line under the recipe name carries the latest batch's churn date only, never a count and never the print date. The margin's batch list, by churn date, is where the count is visible.

### The reading page and its table
- **D-22:** The as-made column's arrival lands the three Phase 1 critique carries together: numeric columns right-aligned and sized to content; a total row; and "trace" or a further decimal for rows under 0.05% (lambda carrageenan 0.16 g). The total row shows the plan total and an as-made total that sums the as-made where written and the plan elsewhere, labelled as such.
- **D-23:** A blue "actual" beside each target chip is deferred; the per-step changed line carries it in the maker's words until the step-macro work in Phase 3.
- **D-24:** Leaving the page with unsaved ink uses the browser's own leave warning only. A reload loses the draft; draft persistence lands with UX1-02 in Phase 4.

### Carried forward, not re-decided here
- The confirmed brief `.impeccable/surfaces/route-recipe-batch.md` is the design contract: three places for ink; the pen layer as a state of the recipe page's regions, not a page or modal; hairline ink fields, pen blue for everything the maker types; "unknown" in words for a blank measured field; nothing pre-filled from the recipe; no colour on state; save as an explicit act that snapshots the version's rows and coefficients; the version never written while recording; blank stored as absent; desktop only; transcription by hand with no parsing or model call; keyboard-operable with visible labels at AA.
- Phase 1 D-05, D-06, D-14, D-15: versions embed their rows' coefficients; IndexedDB behind the repository seam is the only store path; routes are URL-addressable; Vitest with a node-environment domain suite.
- Outcome dimensions are four fixed core axes plus the version's declared axes (PRODUCT.md, decided 2026-09-06).

### Claude's Discretion
- The store shape: a separate `batches` object store keyed by id with an index on the version id, the DB version bump and its upgrade path, and the batch record's field names and schema-version field. Export and import carry batches; the store file's `schemaVersion` moves to 2 and the validator covers batch records with the same refuse-whole-file rule as versions. Whether a `schemaVersion` 1 file still imports is Claude's call, stated in the plan.
- The repository seam's new methods, sized to Phases 2–4.
- The snapshot's exact contents beyond rows and coefficients (the brief says rows and coefficients; the coefficient set id is stable and must be cited).
- Component decomposition of the pen layer within the recipe page's regions; how the tab order follows the sheet's order; the wording of "recorded 4 Aug 2026 against 50 g oil · 800 g" and "date unknown" beyond what the brief fixes.
- The exact wording of the empty margin's "no batch yet" state and how a version with two batches lists them.
- How the seed carries the 2 Aug batch for the fixture and UAT (seeded like the version, or entered in UAT), provided the stored record is indistinguishable from one the maker typed.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design authority
- `.impeccable/surfaces/route-recipe-batch.md` — the confirmed brief for this surface: job, proof content (the 2 Aug ink), thesis, the three places for ink, dimensions, silence as a value, the ceremony, reopening and amending, scope, states and ranges, interaction, binding constraints, and what a builder must not invent. Two corrections from this discussion: step 9 reads "Speed Δ @ 20 min", and the log block is a churn section plus dated tasting sections (D-01), so the result, marks, meltdown, tasting temperature, and next-time note belong to a tasting.
- `.impeccable/surfaces/route-recipe.md` — the recipe page brief this layer lands in; § 7 carried the batch-count question settled by D-21.
- `DESIGN.md` and `.impeccable/design.json` — the Formulation Cookbook as recorded from Phase 1; the Two-Ink, No-Verdict, and Bookcloth rules; pen blue defined and first painted here.

### Product authority and language
- `product-requirements/03-decision-register.md` — D04 (separate recipe, version, batch, observation; preserve history), D08 (success and disappointment in one lightweight history), D12 (rating controls and labels open), D11 (language), D16 (storage open).
- `product-requirements/04-requirements.md` §BATCH-01, §BATCH-02, §OBS-01 — the packet criteria the phase's IDs derive from.
- `product-requirements/05-domain-and-language.md` — core records, data invariants, vocabulary.
- `PRODUCT.md` — Impeccable product record; outcome dimensions decided as four core axes plus declared.

### Delivery record
- `.planning/PROJECT.md` — key decisions, the coefficient-drift hazard, the working-case facts (superseded by D-10 to D-13 above).
- `.planning/REQUIREMENTS.md` — BATCH1-01, BATCH1-02, BATCH2-01, BATCH2-02, OBS1-01, UX1-01 text.
- `.planning/ROADMAP.md` Phase 2 — success criteria; criterion 5 is the coefficient-drift hazard.
- `.planning/STATE.md` — the Phase 2 carries from the two Phase 1 critiques (table sizing, total row, trace, note rhythm).
- `.planning/phases/01-read-the-churned-recipe/01-CONTEXT.md` — Phase 1 decisions carried forward (D-05 to D-16).

### Working-case sources (outside the repo; read, do not copy code)
- `/Users/mark/Documents/projects/old-sprinkles/src/data/olive-oil.js` — `CORE_AXES` with the behavioural anchor words (D-14); the earlier attempt's declared-axis slots.
- `/Users/mark/Documents/projects/old-sprinkles/.impeccable/surfaces/route-batch.md` — evidence only: behavioural anchors never adjectival; the draw and from-freezer occasions (meltdown from freezer, D-08); why the signed scale was rejected.
- `/Users/mark/Downloads/IMG_2485–2489.HEIC` — the five photographs of the 2 Aug sheet; primary evidence for the transcription in D-10.
- `Ice Cream Log Pages/sprinkles-churn-log-binder-audit.md` — the binder audit: 14 of 29 batches left no result; the stakes for silence as a value.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/src/ui/RecipePage.jsx` — the page whose regions the pen layer becomes a state of: headnote (version line), ingredient table region, method region, side region with the formulation note and the margin (`advisory-slot`, authored notes). Reads the version through `repository.getVersion(id)` from `useParams`.
- `app/src/ui/IngredientTable.jsx` and `app/src/ui/Method.jsx` — the table and the step list the as-made column and the per-step strike and changed line attach to; steps are keyed by `n` with `leadIn`, `instruction`, `targets`, `purpose`, `aside`.
- `app/src/styles/tokens.css` — every visual value; pen blue is defined there and unused since Phase 1. The batch layer must add no literal outside it.
- `app/src/data/olive-oil.js` — the seeded version: `id 'olive-oil-ice-cream-v1'`, `coefficientSetId '2026.1-slice-transcription'`, rows `row-01` to `row-12` with embedded `ingredient`, `declaredAxes: ['Olive oil character', 'Bitterness']` (bare names, to become `{ name, low, high }` per D-15), `equipment.machine 'Whynter'`, `iceEd.overrunPercent null`.
- `app/src/domain/composition.js` and `figures.js` — framework-free; the snapshot cites their coefficient set and does not recompute at read time.

### Established Patterns
- Every store access goes through `app/src/store/repository.js` (`listVersions`, `getVersion`, `saveVersion`, `getAll`, `putAll`); no other module imports `idb`. Batches need their own methods on the same seam.
- `app/src/store/db.js` — `DB_VERSION 1` with a single `versions` object store keyed by `id`; a `batches` store means version 2 and an upgrade branch.
- `app/src/store/transfer.js` — whole-store export/import with `schemaVersion 1` and `versions` only; the validator refuses the whole file on any error and rejects prototype-mutating keys. Batches must join it (Claude's discretion on the version bump and backward import).
- `app/src/store/seed.js` — seed-on-empty through the seam; the 2 Aug batch may seed the same way if the planner chooses.
- Domain tests run under Vitest's node environment; component tests opt into a DOM environment per file.
- Accessible names are built explicitly (aria-label) so state is provably in the accessible name; a marked control is a native `<button>` with one aria-label.

### Integration Points
- `app/src/router.jsx` — add `/recipe/:id/batch/:batchId` rendering `RecipePage` with the batch layer (D-19); no route for the recording state.
- The headnote's `versionLabel` line gains the latest churn date (D-21).
- The margin region gains the batch-log block above the advisory slot and the authored notes, in the printed page's order.

</code_context>

<specifics>
## Specific Ideas

- The focal moment is the spread after saving, looking like the photograph: 383 beside 370.4, 241 beside 252.8, 45 beside 40, 0 beside 1.2 on the struck lecithin row, step 1 struck, step 8's line "blend 60 s", step 9's line "Fast, Soft, Prechill 15 min. Speed Δ @ 20 min, really thick @ 24, full churn 30", and in the margin "20 min", "−6 °C", "unknown" for overrun, "Soft, not greasy", all in one blue against the black plan.
- The 2 Aug tasting reads: date unknown, −12 °C, olive oil character 4.5, bitterness 5, sweetness 4, hardness, scoopability, and smoothness unmarked, meltdown 3 g at 20 min, no words. The batch therefore has a tasting and does not say "not yet evaluated".
- Saving states in words what was recorded and when, in the brief's form: "recorded 4 Aug 2026 against 50 g oil · 800 g"; an amendment states its date the same way.
- Anchor words are behavioural, never adjectival: "spoon sinks … spoon won't enter", not "mild … strong".

</specifics>

<deferred>
## Deferred Ideas

- Structured machine settings on the version's equipment profile when a machine has them (Whynter: Fast, Soft, Prechill 15 min), so a step's settings are data rather than prose — recipe side, Phase 3 or later.
- The printed recipe shows no equipment details at all — Phase 4 print carry.
- Micro-ingredient handling below the 1 g kitchen-scale resolution (the gums at 1.04, 0.48, 0.16 g): the equipment profile already carries a 0.01 g precision scale, and FORM2-02's master-blend multiple is the Phase 3 home; the printed sheet is Phase 4's.
- Method step amounts as references to ingredient rows (replacement macros) so the table's amounts and their changes flow into the method — Phase 3 editing; decision input recorded in D-13.
- A common library of declared dimensions with behavioural anchors (bitterness especially) that a version picks from — later phase, with the ingredient or recipe library.
- A blue "actual" beside each target chip — after the step-macro work (D-23).
- The batch's as-made value as a second tick on each graduated rule — deferred by the brief.
- Draft persistence of unsaved ink across reload — UX1-02, Phase 4 (D-24).

</deferred>

---

*Phase: 02-record-the-first-batch*
*Context gathered: 2026-09-06*
