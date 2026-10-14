# Phase 3: Develop the next version - Context

**Gathered:** 2026-09-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 gives the plan the pen that Phase 2 gave the record. On the recipe page, "Develop the next version" opens the pen on any version: grams, step allocation, and remove/restore per row; step text, purpose, aside, target chips, the step's "uses" list, and remove/restore per step; headnote prose; authored notes with inherited-from markers. Every changed value shows the old value struck in ink beside the new one in pen blue while the pen is open. The six figures and the margin's derived advisories answer live. Saving lives in the headnote: version line (required), reason (optional), a cited batch (optional), then "Save as a new version" on any version and "Save over this version" only on an unchurned one. A saved version has its own URL and reads clean; its lineage line names its parent and cited batch and holds one show-changes toggle that lays the tracked-changes grammar back on the page against the parent. A version strip lists every version of the recipe. The margin gains the four FORM2-02 advisories with basis lines. The running head "Sprinkles" becomes the link home and "no recipe found" links back to the list; the recipe list shows each recipe once at its most recently created version. The version record gains lineage fields, removed flags, step "uses" lists, and inherited-note markers; the store and the transfer validator move with it.

Requirements REC1-02, REC1-03, REC1-04, REC1-05, FORM1-03, FORM2-01, FORM2-02, with UX1-01 as a build constraint. Success criteria are in `.planning/ROADMAP.md` Phase 3. The confirmed surface brief `.impeccable/surfaces/route-recipe-version.md` is the design contract and settles everything not listed under decisions below.

Not in this phase: adding rows or steps and editing target bands (held objections, next milestone); scaling and machine capacity (SCALE-01); the ingredient library (ING-01); comparing siblings or a version against a batch's as-made (LEARN-01); as-made ticks on the rules and a blue "actual" per chip; step amounts referencing rows (deferred beyond this milestone); diagnosis (D07); printing (Phase 4); draft persistence across reload (UX1-02, Phase 4); phone; deleting a version.

</domain>

<decisions>
## Implementation Decisions

The brief left five things to this discussion. Three areas were discussed; the fifth question (partly marked tastings) was not taken up and its prior position stands unchanged (see D-11).

### Opening the pen and addressing changes
- **D-01:** The headnote control that opens the pen reads **"Develop the next version"** on every version, churned or not. The save controls name the outcome at the end ("Save as a new version"; "Save over this version" on an unchurned version only).
- **D-02:** The show-changes state is URL-addressable by a **query parameter** (for example `?changes`) on the version's URL, so it composes with `/recipe/:id/batch/:batchId` without a new route. The toggle in the lineage line still carries `aria-pressed`; back returns to the clean reading; the Phase 4 print route ignores the parameter. The pen itself still has no route (brief § 6). — **Reversibility:** reversible — a query parameter can be dropped or renamed without touching stored records.
- **D-03:** While the pen is open, the struck baseline is **the record the pen opened on**. Forking the churned version, that is the churned version's values. Opening the pen on an unchurned child (v2, parent v1), the struck values are v2's own saved values, not v1's. After a save-over, show-changes on v2 compares against v1 as the brief says; after a save-as-new, v3 compares against v2. One rule serves both outcomes.
- **D-04:** The version line is required and must be **unique within the recipe**. A duplicate is blocked in words beside the save controls, the same way a blank is ("another version already has this line"). The strip and the lineage line identify versions by line, so ambiguity is refused at the source.

### Derived advisories
- **D-05:** **Four advisories ship, not five.** Batch mass against the machine's minimum fill is held for SCALE-01 (the packet gives machine capacity to SCALE-01 and forbids asserting safe fit). The seed's `equipment.minFillG` stays in the record unused by any advisory; the sheet's "confirm 800 g clears your machine's minimum fill" line stays unprinted. The four are the brief's: sub-scale amounts with the master-blend multiple; ultra-pasteurised mass; gum hydration against the hold (naming a step whose temperature target is at or above it); estimated-data exposure. Each ends in a "basis:" line naming its rows; none blocks, colours, or predicts a sensory outcome.

### Schema move and old exports
- **D-06:** The version record's new shape (parent id, snapshot of the parent's version line, reason, cited batch id, creation date; a removed flag on rows and steps; a `uses` list of row ids per step; an inherited-from marker per authored note) arrives by a **one-time IndexedDB upgrade**: the DB version bumps, and the upgrade lifts every stored version to the new record shape with empty defaults, and patches the seeded olive oil record (known by its id `olive-oil-ice-cream-v1`) with the seed file's authored `uses` lists. Rows, grams, coefficients, method text, authored notes, and every batch's snapshot are untouched, and a test proves the churned version's six figures and its batch read identically before and after. D04's "never written" is read as never changing a churned version's content or figures; adding metadata is not that. — **Reversibility:** costly — every stored version and every export carries the new shape; going back means a second migration and a validator change.
- **D-07:** A **schemaVersion 2 store file is accepted and lifted on import** with the same upgrade function the DB uses, so Phase 2 backups keep working; export always writes the new file version. A schemaVersion 1 file keeps its Phase 2 treatment (imports as a store with no batches; refused if it carries batches). The validator refuses the whole file on any error, as before.
- **D-08:** The seed's ten steps carry these authored `uses` lists: step 1 soy lecithin and Graza Drizzle; step 2 locust bean gum, guar gum, lambda carrageenan, sucrose, and whole milk; step 3 sucrose, skim milk powder, dextrose, fine sea salt, whole milk, and heavy cream; step 6 allulose; step 8 Graza Drizzle and soy lecithin; steps 4, 5, 7, 9, and 10 use no rows. Split rows (whole milk, sucrose) appear in both steps 2 and 3. Confirmed by Mark. The cross-flags and the stale-amount flag rest on these lists, never on parsing the prose.
- **D-09:** An imported file carrying a child version whose parent is neither in the file nor already in the store is **refused whole**, consistent with the validator's existing rule. A whole-store export always carries the parent, so a real backup never trips this.

### Carried forward, not re-decided here
- **D-10:** The confirmed brief `.impeccable/surfaces/route-recipe-version.md` § 3–§ 7 is binding: tracked changes not an overlay; strike-and-beside in the page's own structure; removal cross-flags through `uses` and never cascades; the stale-amount flag derived and confined to the pen and show-changes; step amounts stay prose; the save ceremony in the headnote; blank reason saves and reads "no reason recorded"; no default reason, citation, or version line; inherited notes wear "from <parent line>" until edited here; batch results never copy; advisories after the batch record and before the authored notes; the Strike Rule; a churned version's record and its batches are never written when a child is saved; the child carries its own `structuredClone` of coefficients; show-changes reads the parent record live; the plan's pen and the batch's pen are never open together; cancel discards with no dialog and the browser's own leave warning fires while ink is unsaved; keyboard-operable with visible labels at AA; desktop only.
- **D-11:** **Partly marked tastings** were not discussed; the batch brief's position stands unchanged: an unmarked axis is valid silence, a tasting with some axes marked is complete, and no save guard is added. The UI review's idea of amending a saved tasting's marks is recorded under deferred, not built here.
- Phase 1 D-05, D-06, D-09, D-14, D-15 and Phase 2 D-01, D-06, D-19, D-20, D-21, D-24: versions embed coefficients; IndexedDB behind the repository seam is the only store path; bands live on the version; routes are URL-addressable; Vitest with a node-environment domain suite; a batch is one churn event plus tastings with an opaque id cited by the change reason; the version line carries the latest churn date only; the leave warning is the browser's own.
- STATE.md Phase 2 carry: the replacement-macro idea for step amounts is deferred beyond this milestone (brief § 4); step amounts stay prose and the stale-amount flag covers the gap.

### Claude's Discretion
- The exact query parameter name and value for show-changes, and how it composes with the batch URL in links from the lineage line.
- The DB version number, the store file's schemaVersion number, and whether the version record carries its own bumped `schemaVersion`; the upgrade function's shape, shared between `db.js`'s upgrade and `transfer.js`'s import.
- The field names for parent id, parent line snapshot, reason, cited batch id, creation date, removed flags, `uses`, and the inherited-from marker; how `removed` rows and steps are kept on the record and hidden from the clean reading and from `buildFigures`.
- How "each recipe once at its most recently created version" is derived on the list (a `recipeId` group and creation date already exist or arrive with D-06); no new index is required at 1–6 versions per recipe.
- The domain module boundaries for lineage, diff (per-row grams and share deltas, per-figure deltas), advisories, and the stale-amount and removal cross-flags; all framework-free under `app/src/domain/`.
- Component decomposition of the plan's pen within the recipe page's regions; focus on opening the pen (the Phase 2 precedent: focus the first field on open, return to the opener on close); the exact wording of the blocked-save messages, the "no batch to cite" line, and the lineage line beyond what the brief fixes.
- The advisories' exact wording and number formatting within the brief's four definitions and its anti-goals.
- How the fixture and UAT exercise the schema upgrade against a Phase 2 store and a Phase 2 export.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design authority
- `.impeccable/surfaces/route-recipe-version.md` — the confirmed brief for this surface (2026-09-07): job, proof content, the tracked-changes thesis, the four structural parts (the pen on the plan, removing a row and a step together, figures and advisories live, the ceremony in the headnote, lineage and the strip), inherited notes, the four advisories, scope, states, interaction, binding constraints, the Strike Rule, and what a builder must not invent. § 7's five open items are settled by D-01 to D-09 and D-11 above.
- `.impeccable/surfaces/route-recipe.md` — the recipe page brief this pen lands in; § 3 and § 6 now point at the version brief.
- `.impeccable/surfaces/route-recipe-batch.md` — the batch layer that stays in reading form beside the plan's pen; its strike is the same stroke.
- `DESIGN.md` and `.impeccable/design.json` — the Formulation Cookbook; Two-Ink, No-Verdict, Bookcloth, Paper-Is-Flat rules; to be re-documented after this phase (STATE.md carry).

### Product authority and language
- `product-requirements/03-decision-register.md` — D04 (versions preserved, parent relationship, never overwrite a parent's batches), D06 (balance is an assessment, never a gate), D07 (diagnosis later), D09 (provenance), D11 (language), D12 (open labels), D16 (storage open).
- `product-requirements/04-requirements.md` §REC-01, §FORM-01, §FORM-02, §SCALE-01 — the packet criteria; SCALE-01 owns machine capacity (D-05).
- `product-requirements/05-domain-and-language.md` — recipe version as preserved state; unknowns without fake values.
- `PRODUCT.md` — Impeccable product record; explicitly undecided items (D12 labels, storage, accessibility standard).

### Delivery record
- `.planning/PROJECT.md` — key decisions through Phase 2; the coefficient-drift hazard; the Phase 2 design debt (`Save batch` placement) that the headnote ceremony answers.
- `.planning/REQUIREMENTS.md` — REC1-02 to REC1-05, FORM1-03, FORM2-01, FORM2-02, UX1-01 text.
- `.planning/ROADMAP.md` Phase 3 — success criteria and phase notes.
- `.planning/STATE.md` — Phase 3 inputs and carries: the running head as link home and a real "no recipe found"; open security item T-02-32 (`setMark` own-property write) for the planner to close or re-disposition; the post-phase documenter re-run.
- `.planning/phases/02-record-the-first-batch/02-CONTEXT.md` — Phase 2 decisions carried (D-01, D-06, D-13, D-19 to D-24).
- `.planning/phases/01-read-the-churned-recipe/01-CONTEXT.md` — Phase 1 decisions carried (D-05 to D-16).

### Working-case sources (outside the repo; read, do not copy code)
- `/Users/mark/Documents/projects/old-sprinkles/src/domain/advisories.js` — the earlier attempt's four advisory definitions (`sub-scale`, `heat-carried`, `hydration`, `estimated`); evidence for the derived math, reimplemented framework-free, not imported.
- `Ice Cream Log Pages/sprinkles-churn-log-binder-audit.md` — why the reason must sit on the page that makes the change.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/src/ui/RecipePage.jsx` — the page whose regions gain a second pen mode; today `mode` is `'reading' | 'recording'` with `draft`, `tastingDraft`, and `amendingBatchId`; the plan's pen is a new exclusive mode beside `'recording'`. The `beforeunload` dirty-check pattern and the cancel-discards-silently pattern carry over.
- `app/src/ui/IngredientTable.jsx`, `Method.jsx`, `Authored.jsx`, `FormulationNote.jsx`, `GraduatedRule.jsx` — the table cells, step bodies, notes, and rule heads that the strike-and-beside marks live inside; the batch layer's strike class is the same stroke (Strike Rule).
- `app/src/domain/figures.js` (`buildFigures`) and `composition.js` — recompute per keystroke from a draft's rows; removed rows must be excluded before they reach them.
- `app/src/domain/batch.js` — `formatRecordDate`, `sortedBatches`; the citation list and the lineage line's "after the batch of 2 Aug 2026" read from these.
- `app/src/data/olive-oil.js` — the seed version: `recipeId`, `parentVersionId: null`, `versionLabel`, `equipment` (with `minFillG 700`, `scaleResolutionG 1`, `batchesAhead 4`), `process.pasteuriseC 69`, rows with `step`/`splitStep`, ten method steps keyed by `n`; gains `uses` per step (D-08) and the new lineage defaults.
- `app/src/data/library.js` — per-ingredient `heatTreatment`, hydration temperature, and per-field basis the advisories read from the embedded row copies.
- `app/src/styles/tokens.css` — every visual value; the pen-blue field and strike tokens exist from Phase 2.

### Established Patterns
- Every store access goes through `app/src/store/repository.js` (`listVersions`, `getVersion`, `saveVersion`, `getAll`, `putAll`, batch methods); no other module imports `idb`.
- `app/src/store/db.js` — `DB_VERSION 2`, cumulative guarded `upgrade`; D-06's bump adds a data-lift branch there for stored versions.
- `app/src/store/transfer.js` — `validateStoreFile` accepts file schemaVersion 1 or 2, refuses whole-file on any error, rejects prototype-mutating keys; `importStore` puts versions then batches. D-07 adds the lift and D-09 the parent check.
- `app/src/store/seed.js` — seed-on-empty through the seam; the upgrade's seed-id patch (D-06) is the returning-browser counterpart.
- Domain modules are framework-free and tested under Vitest's node environment; component tests opt into a DOM environment per file.
- Accessible names are built explicitly (a changed cell reads "was 40 g, now 48 g"); state is in weight and outline, never colour.
- Impure calls (`crypto.randomUUID()`, `new Date()`) live only in the page's save handlers; domain functions take `{ id, now }`.

### Integration Points
- `app/src/router.jsx` — no new route; `?changes` is read by `RecipePage` via search params on `/recipe/:id` and `/recipe/:id/batch/:batchId` (D-02).
- `RecipePage` headnote — the "Develop the next version" control, the ceremony fields, the lineage line with the show-changes toggle, and the version strip beneath the headnote.
- `RecipeList.jsx` — one row per recipe at its most recently created version; the transfer controls stay.
- Margin — the derived block ("derived" legend) between `BatchMargin` and `Authored`, replacing the empty `advisory-slot`.
- A running head "Sprinkles" as the link home, and the "No recipe found" state linking to `/`.

</code_context>

<specifics>
## Specific Ideas

- The focal moment from the brief: the pen open on the churned version, 40 struck in ink with 48 written beside it in blue, the record's 45 still beside them in its own blue, the fat rule's head reading its old figure struck before the new one with a hollow tick where the solid one was, and in the headnote a reason half-written that names the batch of 2 Aug.
- Lineage line form: "from 50 g oil · 800 g, after the batch of 2 Aug 2026", parent and batch each a link, then the reason as a headnote paragraph; "no reason recorded" when blank.
- Removal flag words: beneath a step, "uses soy lecithin, which is removed" with "remove this step" offered; beside a row, the mirror with "remove this row" offered. Stale-amount flag: "amounts changed: skim milk powder 22.4 → 24 g" in ink small print beneath the step's targets, pen and show-changes only.
- The 2 Aug batch's evidence for a fork: lecithin at 0 and step 1 struck become two separate removals on the plan, linked through `uses`, never cascaded.
- Working-case data the advisories already have: scale reads to 1 g, four batches ahead (gum take 1.68 g); whole milk and heavy cream ultra-pasteurised (623.2 g of 800); locust bean gum hydrates at 82 °C against a 69 °C hold and step 2 targets 85 °C; estimated bases on whole milk and cream MSNF, allulose PAC and POD, salt PAC.

</specifics>

<deferred>
## Deferred Ideas

- Batch mass against the machine's minimum fill as a derived advisory — SCALE-01, a later milestone (D-05).
- Amending a saved tasting's marks after the fact (Phase 2 UI review) — not in this phase; the batch brief's valid-silence position stands (D-11).
- Editing target bands; adding a step; adding a row from the seed library — Mark's held objections for the next milestone's requirements (brief § 7).
- Step amounts as references to ingredient rows (replacement macros) — deferred beyond this milestone (brief § 4).
- Comparing siblings, or a version against a batch's as-made — LEARN-01.
- As-made ticks on the graduated rules and a blue "actual" per target chip — still deferred.
- Draft persistence of unsaved ink across a reload — UX1-02, Phase 4.
- Deleting a version — out of milestone scope.
- Re-run `/impeccable document` after this phase so `DESIGN.md` records the pen layer's components and the Strike Rule — Impeccable-owned follow-up.

</deferred>

---

*Phase: 03-develop-the-next-version*
*Context gathered: 2026-09-07*
