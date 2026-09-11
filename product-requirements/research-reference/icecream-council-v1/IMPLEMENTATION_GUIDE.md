# Ice Cream Council Data Contract v1 — Implementation Guide

## Goal

Provide a stable, auditable interchange contract between the recipe application, the deterministic formulation engine, and the adversarial ice-cream council.

The contract is intentionally not a database schema. Your internal database may be relational, document-oriented, or event-based. This JSON structure is the canonical boundary format.

## Design principles

1. **Mass first.** Store formulation quantities in grams. Avoid volume measurements in canonical recipe data.
2. **Separate intent from reality.** `RecipeVersion` stores the intended formula; `Batch` stores what was actually made.
3. **Separate observation from batch.** A batch may be evaluated multiple times at different ages and temperatures.
4. **Separate source from derived data.** Ingredient composition and measured process values are inputs. `calculated` is replaceable derived state.
5. **Unknown is null, not zero.**
6. **Version every calculation model.** PAC, sweetness, MSNF, frozen-water, and hardness models will evolve.
7. **Preserve provenance.** Ingredient data quality affects confidence in conclusions.
8. **Prefer reproducibility over false precision.**

## Recommended API/storage behavior

### Ingredient immutability
If the composition of an ingredient materially changes, create a new ingredient revision or new ingredient ID rather than silently changing historical calculations. A practical internal model may add `ingredient_revision`, although it is intentionally omitted from the v1 interchange contract.

### Recipe version immutability
Once a `RecipeVersion` has a physical Batch linked to it, treat that version as immutable. Editing the formula creates a new version.

### Calculated fields
The server/formulation engine should be authoritative for `calculated`. Clients may display cached calculated fields but should not independently overwrite them.

Suggested calculation lifecycle:
1. receive/modify ingredient or RecipeVersion input
2. validate source data
3. calculate
4. stamp `engine_version`
5. persist or return derived block
6. recalculate whenever the engine version changes if desired

### Validation layers

Use three levels:

**Schema validation**
- structural types
- enums
- simple numeric ranges
- required fields

**Domain validation**
- composition sum warning
- referenced IDs exist
- duplicate IDs forbidden
- recipe ingredient masses sum sensibly against target batch mass
- actual ingredient masses are physically plausible
- process temperatures/times are plausible

**Scientific validation**
- implemented by the formulation engine/council
- e.g. lactose crystallization risk, stabilizer dosage concerns, implausible frozen-water predictions

Do not turn scientific heuristics into hard schema failures.

## Stable IDs

Recommended patterns are readable but IDs should not encode mutable display names.

Examples:
- `ing_01J...`
- `recipe_01J...`
- `rv_01J...`
- `batch_01J...`
- `obs_01J...`

UUIDv7 or ULID are good implementation choices.

## Numeric precision

Store sufficient decimal precision internally. Do not round source masses or calculated values for storage merely because the UI displays fewer digits.

Suggested UI display only:
- ingredient mass: 0.1 g
- percentages: 0.01%
- temperatures: 0.1 °C
- model indices: model-specific

## Composition modeling

All ingredient composition percentages are mass percentages and should approximately reconcile to 100%.

Do not infer missing composition fields from nutrition-label calories. Missing values remain unknown internally where possible. The v1 interchange schema currently requires numeric composition fields for deterministic engine behavior; use 0 only when the constituent is known/assumed absent, not merely unavailable. Track uncertainty through provenance and notes.

A future v1.1 may allow constituent-level provenance/unknown values if needed.

## Stabilizer/emulsifier handling

Represent blends as ingredients when they are physically dosed as a blend, but expose their composition:

Example custom blend:
- stabilizer portion: LBG + guar + carrageenan
- emulsifier portion: lecithin

For a 4:4:2:1 lecithin:LBG:guar:lambda-carrageenan blend:
- emulsifier_pct of blend = 4/11 * 100
- stabilizer_pct of blend = 7/11 * 100

A later schema can model individual hydrocolloids as functional constituents. v1 captures total stabilizer/emulsifier contribution while `notes` or an app-specific extension can preserve the sub-blend recipe.

## Model outputs not yet standardized in v1

Do not hard-code these as universal truths yet:
- absolute hardness
- ideal serving temperature
- glass transition
- exact ice fraction
- lactose saturation
- serum-phase viscosity
- flavor-specific target sweetness
- composite 'balance score'

The council may discuss these, but deterministic implementations should be introduced only with a named/versioned model and validation data.

## Extension strategy

Clients MUST ignore unknown fields they do not understand when consuming later compatible minor versions.

Suggested evolution:
- `1.0`: core contract
- `1.1`: additive optional fields
- `2.0`: semantic/breaking changes

Do not reinterpret an existing field in place.

## Recommended v1 acceptance tests

1. A RecipeVersion round-trips through JSON without loss.
2. Ingredient composition can reproduce recipe totals.
3. Changing one ingredient mass changes only derived values, not historical Batch records.
4. A Batch can differ from its RecipeVersion.
5. Multiple Observations can reference one Batch.
6. An Observation at -15 °C and another at -18 °C coexist without ambiguity.
7. `null` remains distinguishable from `0`.
8. Calculation output records its engine version.
9. Invalid foreign keys are rejected by domain validation.
10. Ingredient composition totals outside 98–102% produce a warning, not automatic rejection.

## Council integration contract

The council should receive:
- relevant Ingredient records
- one RecipeVersion
- optional Batch history
- optional Observation history
- freshly calculated formulation state
- calculation-engine/model versions

The council should return analysis separately from canonical source records. Do not let language-model output mutate source ingredient composition or measured batch observations without an explicit user/app action.

## Recommended next additions after v1

1. hydrocolloid-specific composition
2. cocoa solids/cocoa butter detail
3. fruit Brix/acidity
4. nut-paste composition
5. objective measurements such as density/overrun and melt tests
6. formulation ancestry (`parent_recipe_version_id`)
7. experiment/hypothesis entity
8. machine/equipment entity
9. ingredient revisions and constituent-level provenance
10. calibrated hardness/freezing model
