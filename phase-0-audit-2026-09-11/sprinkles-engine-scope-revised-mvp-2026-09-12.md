# Revised scope analysis — direct Engine v0.1 integration into Sprinkles

Date: 12 September 2026  
Status: audit and proposed implementation scope only.  
Supersedes: [earlier integration scope review](sprinkles-engine-integration-scope-review-2026-09-12.md) where it assumes legacy-data preservation or compatibility layers.

## Assessment

**Build the engine contract first, then refactor Sprinkles to use it directly.** Rebuild the reference ingredients and sample recipes, versions and batches in the new model. Remove the superseded calculator when the new calculation and application tests pass.

This is a substantive engine implementation and application refactor, but it no longer needs the backward-compatibility work emphasized in the previous report. There is no reason to preserve the `computeBalance` result shape, retain old PAC/POD displays, maintain a legacy calculator, or translate old stored records merely to keep disposable MVP data working.

The main work is now:

1. Define and implement the independent calculation engine and its public contracts.
2. Reshape Sprinkles' ingredient, formulation and batch data around those contracts.
3. Refactor calculation consumers and presentation to use engine results directly.
4. Rebuild representative development data and update persistence/transfer validation.
5. Verify scientific accounting, incomplete-data behavior and application workflows.

The engine supplies the quantitative foundation for Council review. A practical recipe-review exchange remains a distinct integration deliverable, described below.

## Governing context

The user has clarified that the ingredient database and all existing recipes, versions and batches are disposable reference data. Sprinkles' processing and UI can be refactored freely to use the new engine. Existing interfaces are not compatibility requirements.

These instructions supersede preservation requirements in the SOW and post-audit addendum for **current MVP data**. They do not remove the new engine's requirements for explicit unknowns, provenance, deterministic results, versioned coefficients, or reproducibility of future calculations. They also do not authorize implementation during this audit.

The source findings in the [Phase 0 README](README.md) and [calculation inventory](calculation-inventory.md) remain useful. The previous review verified that all 66 current `app/src/` files matched the Phase 0 source copy, at HEAD `99e436e7957d0c348c2f8a338e2a1037cc91fab5`. This revision changes the scope interpretation based on the user's clarification; it does not claim a new runtime test pass.

## What comes out of the scope

| Previously proposed work | Revised disposition |
|---|---|
| Freeze the existing calculator for historical reproduction | Omit. No current load-bearing history requires it. |
| Migrate old ingredient, recipe and batch records | Omit. Rebuild development fixtures in the new schema. |
| Translate old composition fields and units at runtime | Omit as a compatibility requirement. Store and pass the new canonical representation directly. |
| Preserve old PAC/POD values and target bands | Omit for disposable fixtures. Define new PAC/PRS targets explicitly in the new units. |
| Preserve old export-file compatibility | Omit unless separately required. Introduce a clear new export schema and reject unsupported old files. |
| Wrap engine results to resemble `computeBalance` | Omit. Refactor callers to use the new result contract. |
| Keep the plan-filled “as-made total” convention | Optional product behavior, not a preservation obligation. Prefer clear measured totals and missing-measurement states. |
| Test old numerical outputs and old record migration as acceptance criteria | Replace with tests for the new semantics and intended workflows. Old probes remain documentation of the replaced behavior. |

This removes a significant source of complexity. It does not eliminate persistence work: the new records still need to save, load, export and import correctly.

## Architecture and ownership

The addendum's `app/src/ice-cream-engine/` location remains appropriate for the initial pure module. Existing ES modules and Vitest can support it without workspaces, a service, repository restructuring or a framework change.

The engine should expose a small public interface for recipe calculation, candidate comparison and planned-versus-actual calculation. Its input and result definitions should be the shared source of truth for calculation data. Sprinkles can store those calculation-relevant structures alongside its own recipe identity, method, editing, batch and observation fields.

Sprinkles remains responsible for collecting active portions from a recipe or draft, parsing user input, selecting measured batch portions, saving records and displaying results. Those are ordinary application operations. They do not require a formal adapter subsystem or preservation of old object shapes. The engine remains responsible for canonical mass totals, mass fractions, composition, PRS/PAC and numerical deltas.

Keep UI formatting separate from core numerical precision. A view descriptor for a label, scale or authored target is legitimate presentation code; it must not recreate a second formulation calculation.

## Engine implementation scope

The existing calculator provides a useful weighted-sum pattern, but most v0.1 behavior must be implemented or replaced:

- **Mass and composition:** ingredient mass fractions; nullable composition in grams per 100 g ingredient; explicit water, fat, protein, lactose and individual sugars; dairy-qualified MSNF; water-dependent solids; deterministic precedence for total versus component fat.
- **Sweetness and PAC:** PRS and PAC in sucrose-equivalent grams per 1000 g recipe; frozen coefficient tables; per-component contributions; explicit overrides and vetted fallbacks; dextrose chemical forms and syrup active mass; characterized ethanol.
- **Functional systems:** separate emulsifier and stabilizer accounting; individual hydrocolloids; premix decomposition, including the reference 4:4:2:1 blend; dosage relative to characterized water.
- **Incomplete information:** property-specific coverage, known subtotals, unavailable results, warnings, assumptions and limitations. Missing values cannot become zero merely because an ingredient belongs to a familiar category.
- **Comparisons:** full-precision candidate and planned-versus-actual calculations across the required metric set, without persistence or source mutation.
- **Execution contract:** input validation, unsupported-operation responses, execution ID, deterministic reproducibility key, explicit engine/model/coefficient versions and stable result field semantics.

Delete the obsolete inferred-lactose, residual-water and unvetted salt-PAC calculation branches instead of carrying them into a legacy mode. The absence of legacy support does not permit replacing them with new hidden assumptions.

## Sprinkles change map

Paths below are relative to `app/src/` and identify current implementation areas, not interfaces that must survive.

| Current area | Proposed change |
|---|---|
| `domain/composition.js` | Replace `computeBalance` with engine operations. Move or retain only useful presentation helpers outside the engine. Remove old scientific constants and superseded arithmetic. |
| `data/library.js`, `data/olive-oil.js`, `data/batch-2026-08-02.js` | Rebuild ingredient and development record fixtures using the new schema, explicit composition, provenance and PAC/PRS target units. No requirement to reproduce the old printed-sheet figures. |
| `domain/rows.js`, draft processing in `ui/RecipePage.jsx` | Refactor portion/row structures and draft preparation as useful. Continue distinguishing active versus removed content and incomplete edits; calculate from validated inputs through the engine. |
| `domain/figures.js` | Refactor or replace its six-figure abstraction to read engine results. Handle units, statuses, coverage and contribution references directly. |
| `ui/FormulationNote.jsx`, `ui/GraduatedRule.jsx`, `ui/BasisNote.jsx` | Refactor balance presentation for PRS, canonical PAC units, partial/unavailable results and result-specific provenance. Existing numeric-only assumptions and global lactose explanations must go. |
| `ui/IngredientTable.jsx`, `ui/RecipeList.jsx` | Consume engine mass and fractions. Update planned/measured totals and any changed row structure. Keep rounding as a display choice. |
| `domain/diff.js` | Use engine numerical comparisons; retain application comparisons for text, methods, portions and other authored changes. Show status changes as well as numeric changes. |
| `domain/batch.js`, related recording/amendment UI | Represent measurements and their completeness explicitly; calculate actual formulation from recorded portions. Reshape snapshot metadata and lifecycle functions for the new model. |
| `domain/lineage.js` | Refactor creation/save functions to carry the new formulation and calculation-version metadata. New records start with v0.1; no inherited legacy-ID problem needs accommodation. |
| `domain/advisories.js`, `ui/DerivedAdvisories.jsx` | Read engine facts where calculation-dependent. Keep process/equipment interpretation in Sprinkles; recommendations do not belong in the engine. |
| `store/db.js`, `store/seed.js`, `store/transfer.js`, relevant repository code | Initialize/reseed disposable development data under the new model; update validation and export/import schema. Refactor storage as needed without building a legacy migration ladder. |
| Domain/UI/store tests | Update assertions to the intended new behavior and add coverage for new results and workflows. Do not retain invalid scientific semantics just to keep existing assertions green. |

This is concentrated in the formulation data path and the screens that use it. A whole-application rewrite is unnecessary. Routing, general layout, method editing and tasting capture can remain where useful, but their current implementation is not a constraint if the new data flow calls for changes.

## Rebuilding the reference data

A new library should directly support the engine's composition fields, completeness declarations, chemical forms, dairy provenance, functional components and coefficient overrides where appropriate. Separate ingredient identity/revision from a recipe row's identity so the same material can appear in multiple method portions and be referenced reliably in Council exchanges.

Create a small useful fixture set: characterized dairy, water, pure sugars, dextrose forms, a syrup, separate gums/emulsifier, the reference premix, and deliberately partial/coefficient-only examples. Keep synthetic test composition clearly identified as fixture data. A rebuilt database does not itself establish scientific characterization; unsupported values should remain unknown rather than be filled for a visually complete balance panel.

Rebuild sample recipes and batches against those records. New authored bands should identify the metric and units they target. Do not multiply old POD bands by ten and assume that establishes suitable PRS targets. No current target data needs to constrain these choices.

A richer ingredient editor is not automatically required for this engine task. Development data can begin as reviewed seed records; editing UX should follow the MVP's actual needs.

## User-visible behavior

**Balance figures:** PRS replaces POD for new calculations, PAC/PRS use the new units, and water/solids and other incomplete properties visibly report uncertainty. A partial subtotal cannot receive an unqualified “inside target” label. Contribution details should distinguish a known zero, an unknown field and an estimated/vetted input.

**Live editing:** previews use the same engine as saved recipes and Council candidates. Blank or invalid draft amounts need an explicit UI state; they must not silently appear to be a valid new formulation. Existing temporary fallback behavior can be redesigned rather than preserved.

**Batch recording:** show planned mass separately from measured mass and indicate missing portions. A recorded zero is a measurement. With no positive measured mass, normalized actual composition is unavailable; with partial measurements it describes the measured subset, not the whole churn. Ingredient characterization coverage is separate from measurement completeness. A plan-filled estimate may be offered if useful, but must be a distinct labeled state and is not needed to preserve the old UI.

**Comparisons:** the engine supplies exact numerical deltas and status on each side; Sprinkles decides presentation precision. Unknown values must not be subtracted as zero. Candidate preview remains nonpersistent until the maker accepts a change.

These are input formulation calculations. Processing losses, evaporation and finished-product physical state remain outside v0.1 unless separately specified.

## Persistence and future reproducibility

The implementation can reset and reseed the current disposable MVP store. It need not preserve old imports, targets, snapshots or coefficient IDs. No reset is performed as part of this audit.

Start the new model with enough identity to reproduce future review evidence: frozen input snapshots or immutable input revisions, selected engine/model/coefficient versions, and stable calculation references. Stored version identifiers must select their actual behavior; they cannot be decorative labels around mutable constants.

Versioned v0.1 coefficients are required even if v0.1 is the only implementation initially available. There is no need to manufacture a pre-v0.1 legacy implementation. Future model updates should preserve reproducibility deliberately rather than silently recalculate old evidence with new constants.

A returned Council finding may refer to a calculation after a recipe or batch has been edited. Preserve that calculation's input identity in the review packet or equivalent evidence record. Saving every engine result in the main database is an implementation choice; identifying only the current mutable recipe is insufficient.

Disposable data is the current development policy, not an automatic permanent policy for a production application. A later transition to load-bearing maker data should establish the preservation boundary explicitly.

## Council sharing and the SOW boundary

The user's goal has two related deliverables:

1. **One shared engine:** Sprinkles and any computational Council runner use the same implementation and contracts.
2. **A review exchange:** selected recipe details, batch observations and engine evidence pass to Council; findings and candidate changes return for review.

The SOW covers the engine, Sprinkles integration and a realistic serialized example. It does not fully specify the second deliverable. The current whole-store export in `ui/RecipeList.jsx` / `store/transfer.js` can be refactored, but it is not already a selected recipe review workflow.

A minimal exchange can use local JSON files: export a recipe/version with ingredient input snapshots, optional measured batch/tastings, and the engine result; receive structured findings and proposed mass changes referencing that evidence; calculate a candidate through the engine; let the maker accept it into a version. No network service or automated expert orchestration is necessary for that experiment.

The reference Council contract under `product-requirements/research-reference/icecream-council-v1/` also needs revision. Its required numeric composition fields conflict with nullable inputs, its closed calculated-result objects cannot directly hold the new envelope, and its model-defined PAC/sweetness units and composition-sum guidance differ from v0.1. Refactor that contract to align with engine semantics instead of introducing compatibility translations to preserve an obsolete shape. Observations and Council reasoning remain outside the calculation result.

Finally, the agreed source location creates an independent module within the application package, not a separately distributed package by itself. A Council runner in the same checkout can import its public entry point. A runner elsewhere needs an explicit distribution/version-pinning choice. That small packaging decision should follow the real runtime requirement; it does not justify duplicate formulas, workspaces or a service by default.

## Implementation sequence and acceptance

| Stage | Deliverable |
|---|---|
| 1. Define shared contracts | Canonical ingredient/formulation/result structures; identity and versions; measured-state and candidate-change semantics. |
| 2. Implement engine | All scoped modules, frozen coefficients, coverage/validation, comparison operations and required fixtures/invariants. |
| 3. Rebuild MVP data/storage | New seed ingredients, recipes and batches; aligned save/load/export/import validation; deliberate development-store reset path. |
| 4. Refactor Sprinkles consumers | Direct engine calls throughout the calculation flow; updated balance, editing and actual-batch displays; remove superseded calculation code. |
| 5. Verify and document | Application workflow regressions and build; engine contract/formula documentation; realistic serialized example. |
| 6. Complete review exchange, if included | Aligned Council schema, selected export, returned candidate preview and maker acceptance; runtime-specific engine distribution where needed. |

Acceptance should cover the SOW's twelve fixtures and invariants, plus ingredient/portion identity, removed rows, incomplete drafts, measured zero versus unknown, partial comparisons, contribution tracing, new-store round trips, snapshot isolation and version selection. Existing tests remain useful for workflow behavior, but old numerical baselines are not the specification.

The largest remaining design risks are the treatment of overlapping composition/components, coefficient precedence, property coverage, measured-subset interpretation and stable review evidence. Legacy-data migration is no longer a principal risk or workstream.

No physical freezing/hardness prediction, automatic optimization, sensory inference or recipe advice inside the engine is added by this revised scope. The SOW's three manual Council validation cases remain downstream of deterministic engine testing.

## Audit limits and file preservation

This revision draws on the earlier source inspection and the user's subsequent scope clarifications. It does not independently validate the coefficient science, inspect live maker data, execute Council cases, or claim new test/build results. The Phase 0 record of 374 passing tests is historical evidence only.

This report is a new file. Existing reports, source, supplied documents and stored application data were not modified. Existing project-file content hashes, excluding `.git` and `node_modules`, were checked after writing it.
