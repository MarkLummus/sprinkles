# Sprinkles change scope — Engine v0.1 and Council exchange

Date: 12 September 2026  
Scope: read-only review, with this new report as the sole project write.  
Reference: Git HEAD `99e436e7957d0c348c2f8a338e2a1037cc91fab5`, plus the current working tree.

## Assessment

**The SOW describes a substantial calculation and integration migration, not just extracting the existing calculator into a folder.** The architecture is feasible without restructuring Sprinkles. The main work is replacing legacy calculation semantics, adapting existing ingredient and batch records, making the balance UI understand incomplete results, and preserving historical behavior.

The proposed pure module under `app/src/ice-cream-engine/` is a good fit. Sprinkles already centralizes most formulation calculations in `domain/composition.js`; React and persistence are already outside that function. However, much of its behavior cannot be reused for v0.1 unchanged.

**The SOW establishes a shared quantitative foundation but does not, by itself, deliver the complete Sprinkles–Council review exchange.** A serialized integration example is included. A reusable distributed package, a user-facing Council export/import flow, and accepting Council proposals into a new recipe version are separate deliverables unless added explicitly.

## Review basis and authority

Reviewed the supplied SOW and post-audit decision addendum, [Phase 0 README](README.md), [calculation inventory](calculation-inventory.md), recorded probes and verification, current application source and tests, package configuration, and relevant Council contract references already in the repository.

The documents' commands to implement, including addendum decision 20, were treated as specification content—not authorization. The user's audit-only request governs this work. No implementation, schema migration, data enrichment, or Council execution was performed.

All **66 files currently under `app/src/` are byte-identical to their counterparts in the Phase 0 isolated copy**. HEAD also matches the audit reference. This supports carrying forward its source findings; existing planning/design changes do not constitute an engine implementation. No applicable `AGENTS.md` was found in the project search.

The addendum resolves Phase 0's principal policy questions: legacy-only lactose/residual water/unvetted salt behavior; per-1000-g engine units; PRS versus historical POD; measured-only actual calculations; coefficient precedence; dairy-qualified MSNF; explicit model selection; calculation identity; tolerances; and nondestructive persistence. These should not be reopened as unanswered scientific-policy questions. Implementation details still need to be specified, as identified below.

## Required change map

Paths below are relative to `app/src/`. These are proposed changes, not changes made by this audit.

| Area | Current evidence | Required scope |
|---|---|---|
| Pure engine | `domain/composition.js:22` is the existing `computeBalance` entry point | Add the v0.1 module, public input/result contract, component tables, validation, calculation identity and all specified calculations. Keep engine imports independent of Sprinkles. |
| Legacy calculation | `composition.js:6–65` hardcodes lactose, residual water and PAC/POD behavior | Freeze this behavior behind explicit historical model selection. Replace authoritative new-calculation branches after consumer regression checks; retaining a legacy implementation is justified only for reproduction. |
| Input adaptation | `domain/rows.js`, embedded ingredients in `data/olive-oil.js`, `domain/batch.js` | Filter removed rows, sum portions, preserve row identity and snapshots, map units and unknowns, and select versioned calculation context. Keep maker workflows outside the engine. |
| Figure assembly | `domain/figures.js:140` calls `computeBalance` and assumes numeric values | Build figures from engine results, including status, coverage, contributions, units and model provenance. Separate completeness from the existing stated/derived/estimated/inherited basis. |
| Balance display | `ui/FormulationNote.jsx`, `ui/GraduatedRule.jsx`, `ui/BasisNote.jsx` | Render partial/unavailable values safely; update PRS/PAC wording and scales; replace the global legacy provenance statement with result-specific provenance. Guard direct numeric formatting and fat breakdowns. |
| Recipe page/edit preview | `ui/RecipePage.jsx:503–550` materializes live drafts and contributor highlights | Route accepted draft inputs through the adapter; preserve removed-row filtering, draft parsing and save rules. Highlights must explain missing contributors as well as positive known contributions. |
| Ingredient table/list | `ui/IngredientTable.jsx:379–398`, `ui/RecipeList.jsx:110` consume balance mass | Use engine mass/fractions with existing display rounding and trace conventions. Make plan-filled batch totals explicit. These relatively simple consumers should not require a layout redesign. |
| Comparisons | `domain/diff.js:211–219` compares formatted figure values | Add engine full-precision numerical comparisons with status on both sides. Keep method/text/row editing differences and display-precision highlighting in Sprinkles. Handle incompatible historical metrics explicitly. |
| Advisories | `domain/advisories.js:147,171` consumes figures and balance | Supply engine totals/provenance to existing process/equipment advice. Do not move recipe recommendations or hydration interpretation into the engine. |
| Version/batch lifecycle | `domain/lineage.js:100` inherits the parent coefficient ID; `domain/batch.js:68` snapshots it | Define how new v0.1 calculations and new child versions select their model, while old versions and batch snapshots retain legacy reproduction. Preserve the maker's original inputs. |
| Persistence/transfer | `store/transfer.js:74`, `store/db.js:4–20`, `store/repository.js` | Keep old records readable. If persisting nullable composition or new metadata, update validation and compatibility behavior and test round trips/upgrades. Never reuse reset/recreate migration behavior. |
| Verification/documentation | Existing domain, data, UI and store suites | Add engine fixtures/invariants and integration/migration regressions; document intentional numerical differences, units, input mapping, versions and the serialized Sprinkles example. |

This touches several domain modules and approximately seven direct UI components, plus advisory rendering and related tests where result wording changes. It does not require replacing the router, repository abstraction, recipe editing workflow, or tasting system. Exact file count depends on adapter factoring; it is not a reliable effort estimate.

## New engine work versus reusable code

Reusable foundations include weighted mass arithmetic, portion aggregation, active-row filtering, immutable snapshots, and the existing pure-function testing style. Formatting helpers can remain in Sprinkles, but should format engine-supplied percentages rather than become a competing source of canonical fractions.

Most new work is semantic and contractual:

- Nullable composition with per-property mass coverage and independent complete/partial/unavailable states; input errors separated from warnings.
- Explicit water, protein, lactose, individual sugars and dairy-qualified MSNF; deterministic total/component-fat precedence and avoidance of overlapping composition totals.
- PRS and PAC component contributions, frozen `prs_v1.0` and `pac_v1.0` tables, vetted overrides/fallbacks, chemical forms and ethanol. One contribution path per active mass; no override/component double counting.
- Functional premix decomposition, separate emulsifier/hydrocolloid accounting, blend fractions and water-relative dosage. Existing gums/lecithin classification is useful, but the full functional result is new.
- Pure candidate evaluation and planned-versus-measured batch comparisons across the full required metric set.
- Structured warnings, assumptions and limitations; explicit unsupported-model results; execution ID plus a deterministic key including normalized input, requested modules and all relevant versions.

The current ES-module application and Vitest setup can support this without another repository, workspace, service or framework. JavaScript with a documented/schema-validated public contract is possible; a TypeScript conversion is not required by the SOW.

## Changes a maker would notice

### Results become more honest about missing information

`computeBalance` currently substitutes zero for absent composition and can label missing properties as stated. The new result must distinguish “known subtotal” from a complete figure. For the audit's 950 g characterized / 50 g unknown fat example, 95 g fat and 9.5% recipe mass become a **partial subtotal at 95% coverage**.

This is a real UI requirement: `GraduatedRule`, `FormulationNote` and `diff` currently call `.toFixed()` on expected numbers. Simply changing a return value to `null` would break them. Unknown or partial values must not generate an unqualified “inside target” judgment or a precise-looking rule marker.

The seed ingredient library has no explicit water, protein or lactose fields. Applying v0.1 to the existing snapshots therefore cannot reproduce all current figures as complete. Adding an engine does not create the missing ingredient characterization. Future reviewed ingredient revisions can improve coverage; old snapshots must remain intact. Names/categories alone should not silently characterize a whole ingredient or turn absent fields into known zeros.

### PAC and sweetness require coordinated units and history

The old seed reports PAC about 24.06038 and POD about 13.04614. Multiplying these by ten produces 240.60380 and 130.46139 on a per-1000-g scale **only under the old calculation assumptions**. It does not validate them as v0.1 PAC/PRS. The Phase 0 probe field named `prsPer1000g` is only a scale-converted legacy POD value and must not become an authoritative PRS fixture.

New engine outputs use sucrose-equivalent grams per 1000 g recipe. Historical PAC/POD values and authored target bands remain stored as authored. An explicit display conversion can change a historical PAC band `[22,26]` to `[220,260]`; scale conversion alone does not establish that a legacy POD band is a valid target for the new PRS model. UI labels, target comparison compatibility, chart domains, precision and provenance need to change together.

Legacy lactose inferred as 54.5% of MSNF, residual water/solids and the sea-salt PAC coefficient remain available only through historical reproduction. New calculations disclose their absence or reduced coverage. No exact new seed PAC/PRS is promised before adaptation/vetting rules and characterization are implemented.

### Actual batch results acquire a distinct meaning

`asMadeForPortion` preserves unknown and zero correctly. `asMadeTotals` fills missing portions from the plan. That convention can remain visibly labeled as a plan-filled estimate; it cannot supply an authoritative actual-composition denominator.

The adapter must use the batch's frozen row snapshot and measured portions, distinguish `measured_actual`, `partial_actual` and `plan_filled_estimate`, and preserve a recorded zero. With no measured mass, normalized actual formulation is unavailable. With some measurements, normalization describes the measured subset, not the complete churn. Composition coverage within that subset is separate from completeness of actual measurement; actual whole-batch mass coverage cannot be known from unmeasured masses. Deltas must carry this qualification.

This is ingredient input mass accounting. Evaporation, processing losses and finished-product composition are not implicitly modeled by the new actual-batch operation.

## Historical and persistence scope

The current embedded inputs and batch snapshots are a strong foundation, but a stored `coefficientSetId` presently does not select calculation behavior. `BasisNote` prints the current global label. Reproducibility needs a registry/dispatcher that actually selects frozen behavior and coefficients, and refuses unsupported versions rather than silently applying the latest model.

A particular integration trap is child creation: `createChildVersion` copies the parent's legacy coefficient ID. Merely wiring dispatch to that field could leave every newly developed descendant on legacy calculations. Separate historical source provenance from the selected calculation context, and specify how a newly accepted version adopts v0.1. Do not overwrite the parent's metadata or relabel old POD results.

A database version bump is **not inherently necessary** for a pure engine and transient adapter: omitted legacy composition keys can map to engine nulls without changing stored records. If nullable/new composition and calculation metadata are stored, transfer validation must support the resulting records. DB version, export schema, RecipeVersion schema and Batch schema are distinct version numbers and need not advance together.

If an IndexedDB upgrade is chosen, its present delete/recreate branch must be replaced with explicit data-preserving behavior. The same issue applies to supporting an older live database on upgrade; avoiding a bump alone does not repair existing older-version reset semantics. Regression tests must demonstrate preservation, not simply successful reseeding. Repository CRUD can probably remain largely unchanged.

Exported calculation evidence should retain enough frozen input and model identity to reproduce it after a batch amendment or recipe correction. A calculation ID pointing only at a mutable current batch is insufficient. Persisting every result inside Sprinkles is not mandated; a self-contained exported evidence packet is another option.

## Gap between the SOW and the Council review workflow

### Shared module is not yet a separately consumable package

The addendum explicitly chooses `app/src/ice-cream-engine/` and no restructuring. `app/package.json` is private and has no engine package entry/export configuration. This is a logically independent module, not a published package deliverable.

For a Council runner that can import JavaScript from the same checkout, a stable engine entry point and usage example may suffice. For a separate runtime/repository, specify distribution and version pinning as additional work. Do not copy the formulas into Council prompts or maintain another calculator. A service, REST API or MCP server is explicitly outside this SOW.

### Current transfer is a whole-store backup

`ui/RecipeList.jsx` exports `sprinkles-store.json`; `store/transfer.js` imports schema-4 versions and batches. This is not a selected-recipe review packet, a calculation-result export or a proposal importer. Calling the existing import path with Council output would be the wrong acceptance workflow.

A practical follow-on exchange milestone would provide:

1. A selected RecipeVersion and optional Batch/tastings export, with frozen ingredient inputs, engine result, units, versions, IDs and coverage. Keep source records separate from derived evidence.
2. A versioned Council result/proposal contract that references the source version and calculation. Preserve findings as reasoning, and proposed mass changes as hypothetical candidates.
3. Candidate preview using the same engine, with explicit handling of stale source versions and row/ingredient identity. Current rows have IDs and embedded ingredients, but not a universal ingredient-revision identity suitable for all external references; do not merge distinct snapshots by display name.
4. A maker acceptance action using Sprinkles' existing version creation workflow. No automatic application of Council recommendations or overwriting measured observations.

These are additions to engine implementation, not prerequisites for every engine unit test. Manual file exchange can serve the experiment without new infrastructure.

### Existing Council reference contract needs reconciliation

The repository already contains `product-requirements/research-reference/icecream-council-v1/`. Its schema is useful prior design, but not directly compatible with the new engine contract:

- `icecream_council_v1.schema.json`, `$defs.composition`, requires numeric composition properties; unknown nullable engine inputs cannot faithfully fit that shape.
- `$defs.calculated` and nested result objects use closed property sets. The new coverage/status/contribution/ID envelope cannot simply be inserted wholesale.
- The dictionary leaves sweetness and PAC units “model-defined”; v0.1 requires explicit per-1000-g semantics and coefficient/model identity.
- The implementation guide suggests a 98–102% composition-sum warning. The addendum instead permits uncharacterized remainder and warns only when characterized composition exceeds 100% beyond numerical tolerance.

Version or adapt this exchange contract before claiming round-trip compatibility. Do not fill missing values with zero to satisfy its old schema. Its optional physical-model fields do not authorize implementing or fabricating those outputs. This is a targeted contract check, not a complete audit of Council execution or every schema field.

## Proposed implementation sequence and acceptance boundaries

| Stage | Reviewable outcome |
|---|---|
| 1. Freeze compatibility | Legacy seed/probe regressions; model dispatch contract; mapping of old fields, target units and identity; explicit child-version and partial-actual policies. |
| 2. Build pure engine | All SOW modules, result schemas, versioned tables and twelve required fixtures; invariants, invalid-input and unsupported-model behavior. |
| 3. Integrate Sprinkles | All mapped consumers use engine-backed data; honest unknown/partial UI; numeric candidate and measured-actual comparisons; no duplicate new-calculation authority. |
| 4. Preserve records | Snapshot, transfer, version creation and any upgrade regressions pass with old maker data unchanged; independent historical recalculation works. |
| 5. Complete SOW evidence | Full relevant application regression suite/build; documentation and a realistic serialized Sprinkles calculation example, preserving its actual partial coverage. |
| 6. Add Council exchange | Versioned packet/proposal mapping, selected export, candidate review and explicit acceptance if the desired product scope includes the full review cycle. Separate packaging only where the Council runtime needs it. |

The highest effort/risk is in compatibility and truthful presentation, not mass multiplication. Important implementation decisions still needing concrete contracts are: candidate add/remove/duplicate-row semantics; ingredient snapshot identity; warning numerical tolerance; cross-model comparison policy; new-version model adoption; and exchange schema/distribution choice. They can be resolved without reopening the addendum's settled scientific rules.

Required tests should include the SOW's twelve fixtures and invariants, plus removed/split rows, zero versus missing actuals, empty/invalid drafts, unknown-versus-known zero display, partial target comparisons, old target preservation, explicit historical dispatch, override double-count prevention, premix overlap, snapshot isolation, and data-preserving transfer/upgrade behavior. Repeated numeric calculations should use documented tolerances and canonical ordering where practical.

No new optimization, sensory prediction, recipe advice in the engine, physical freezing/hardness model, ingredient-library redesign, or automated Council orchestration is needed to complete the SOW. The three manual Council cases in SOW §69 remain downstream validation, as the SOW states.

## Verification and limitations

This report is based on source inspection and byte comparison with the Phase 0 source copy. The prior audit recorded **13 test files / 374 passing domain, data and store tests**; this review did not rerun them and makes no new test-pass or UI/build claim. No live browser database or private maker records were inspected. Scientific coefficients were evaluated against the supplied specification, not independently validated through literature research.

Only this new report was created in the project. Existing source, attached documents and audit artifacts were not edited. A content-hash comparison of existing project files (excluding `.git` and `node_modules`) was used to verify preservation after writing the report.
