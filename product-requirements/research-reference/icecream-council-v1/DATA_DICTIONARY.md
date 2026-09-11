# Ice Cream Council v1 — Data Dictionary

## Conventions

- Canonical interchange format: JSON.
- All recipe and ingredient quantities are mass-based.
- Ingredient composition is expressed as grams per 100 g ingredient and represented as `*_pct`.
- Recipe-level percentages are percentages of total recipe mass.
- Temperatures are degrees Celsius.
- Times are decimal hours unless explicitly named otherwise.
- Unknown values are `null`; do not use `0` to mean unknown.
- Raw/source values and calculated values are separate.
- IDs are stable machine identifiers and should not be reused for a different semantic object.
- All timestamps should be ISO 8601 with timezone.
- Sensory values use 1–10 ordinal scales.

## Entity relationships

`Recipe 1 -> many RecipeVersion`
`RecipeVersion 1 -> many Batch`
`Batch 1 -> many Observation`
`Ingredient many <-> many RecipeVersion`

## Ingredient

| Field | Type | Req | Unit | Definition |
|---|---|---:|---|---|
| ingredient_id | string | yes | — | Stable unique ID for an ingredient definition. |
| name | string | yes | — | Human-readable ingredient name. |
| category | enum | yes | — | Functional category: dairy, sugar, fat, stabilizer, emulsifier, cocoa, fruit, nut, flavoring, alcohol, inclusion, other. |
| composition_basis | const | yes | — | Always `per_100g` in v1. |
| composition.* | number | yes | g/100g | Ingredient constituent mass per 100 g ingredient. |
| functional.sweetness_factor | number/null | no | relative | Relative sweetness factor, normally sucrose=1.0. |
| functional.freezing_point_factor | number/null | no | relative | Heuristic factor for simple PAC-style models. |
| provenance.source_type | enum | yes | — | Origin of ingredient data. |
| provenance.source_name | string/null | no | — | Human-readable source. |
| provenance.source_reference | string/null | no | — | Citation, URL, publication, label revision, etc. |
| provenance.confidence | enum | yes | — | high, medium, low, unknown. |
| provenance.notes | string/null | no | — | Provenance caveats. |
| notes | string/null | no | — | Ingredient-specific notes. |

### Ingredient composition fields

| Field | Definition |
|---|---|
| water_pct | Water mass. |
| fat_pct | Total fat mass. |
| protein_pct | Total protein mass. |
| lactose_pct | Lactose mass. |
| sucrose_pct | Sucrose mass. |
| glucose_pct | Glucose/dextrose mass. |
| fructose_pct | Fructose mass. |
| allulose_pct | Allulose mass. |
| other_sugars_pct | Sugars not represented above. |
| other_carbohydrate_pct | Digestible/structural carbohydrate not otherwise represented. |
| fiber_pct | Dietary/functional fiber. |
| ash_pct | Minerals/ash. |
| alcohol_pct | Ethanol or equivalent alcohol mass fraction represented as percent by mass for v1. |
| stabilizer_pct | Hydrocolloid/stabilizer mass. |
| emulsifier_pct | Emulsifier mass. |
| other_solids_pct | Remaining modeled solids not captured elsewhere. |

### Ingredient composition invariant

The sum of all composition fields should normally be near 100%. Recommended validation:
- warning: total < 98% or > 102%
- hard failure only if total < 0% or > 105%

Do not force exactly 100% because source nutrition data is rounded and some ingredients are incompletely characterized.

## Recipe

| Field | Type | Req | Definition |
|---|---|---:|---|
| recipe_id | string | yes | Stable conceptual recipe identifier. |
| name | string | yes | Recipe name. |
| product_type | enum | yes | ice_cream, gelato, sorbet, sherbet, frozen_yogurt, non_dairy_frozen_dessert, other. |
| description | string/null | no | Human description independent of any specific version. |

## RecipeVersion

| Field | Type | Req | Unit | Definition |
|---|---|---:|---|---|
| recipe_version_id | string | yes | — | Immutable formulation/version ID. |
| recipe_id | string | yes | — | Parent Recipe ID. |
| version | integer | yes | — | Monotonic recipe version number. |
| created_at | datetime/null | no | — | Creation timestamp. |
| targets.batch_mass_g | number/null | no | g | Intended batch mass. |
| targets.serving_temp_c | number/null | no | °C | Target product temperature at consumption. |
| targets.sweetness_level | enum/null | no | — | very_low, low, moderate, high, very_high. |
| targets.texture_target | string/null | no | — | Human/controlled target such as dense_creamy. |
| targets.overrun_pct | number/null | no | % | Target overrun by volume. |
| ingredients[] | array | yes | — | Ingredient references and target masses. |
| ingredients[].ingredient_id | string | yes | — | Ingredient foreign key. |
| ingredients[].mass_g | number | yes | g | Formula mass for that ingredient. |
| calculated | object | no | — | Derived formulation values. Never treated as source input. |
| notes | string/null | no | — | Version-level notes. |

### Calculated formulation fields

| Field | Unit | Definition |
|---|---|---|
| engine_version | — | Calculation engine/model version. |
| water_pct | % recipe mass | Total water. |
| total_solids_pct | % recipe mass | `100 - water_pct`, subject to model rules. |
| fat_pct | % recipe mass | Total fat. |
| protein_pct | % recipe mass | Total protein. |
| msnf_pct | % recipe mass | Milk solids-not-fat; calculation methodology must be versioned. |
| stabilizer_pct | % recipe mass | Total modeled hydrocolloid/stabilizer. |
| emulsifier_pct | % recipe mass | Total modeled emulsifier. |
| sugars.* | % recipe mass | Individual and total modeled sugars. |
| sweetness.relative_index | model-defined | Relative predicted sweetness. |
| sweetness.model_name | — | Exact model/parameter-set name. |
| freezing.pac_heuristic | model-defined | Conventional PAC-style comparative metric. |
| freezing.model_name | — | Freezing model/parameter-set name. |
| freezing.frozen_water_curve[] | °C / % | Estimated frozen-water fraction by temperature. |

Calculated values should be reproducible from source data + engine version. Clients should be allowed to discard and regenerate them.

## Batch

| Field | Type | Req | Unit | Definition |
|---|---|---:|---|---|
| batch_id | string | yes | — | Unique physical batch ID. |
| recipe_version_id | string | yes | — | Formula intended for this batch. |
| made_at | datetime/null | no | — | Batch production timestamp. |
| actual_batch_mass_g | number/null | no | g | Measured final/pre-freeze batch mass according to application convention. |
| actual_ingredients[] | array/null | no | — | Actual weighed ingredients. Absence means not captured; do not assume recipe targets were exact. |
| process.mix_max_temp_c | number/null | no | °C | Maximum mix temperature reached. |
| process.homogenization_method | string/null | no | — | Blender/homogenization method. |
| process.aging_hours | number/null | no | h | Aging duration before freezing. |
| process.aging_temp_c | number/null | no | °C | Aging environment/product temperature per app convention; specify in UI. |
| process.machine_id | string/null | no | — | Machine/equipment identifier. |
| process.draw_temp_c | number/null | no | °C | Product temperature at draw. |
| process.measured_overrun_pct | number/null | no | % | Measured overrun. |
| process.hardening_temp_c | number/null | no | °C | Hardening environment temperature. |
| process.storage_temp_c | number/null | no | °C | Storage environment temperature. |
| process.storage_hours_before_test | number/null | no | h | Elapsed storage before first intended evaluation. |
| process.process_notes | string/null | no | — | Process deviations/notes. |
| notes | string/null | no | — | Batch-level notes. |

Important: freezer/storage temperature is not the same as product temperature.

## Observation

| Field | Type | Req | Unit | Definition |
|---|---|---:|---|---|
| observation_id | string | yes | — | Unique evaluation event ID. |
| batch_id | string | yes | — | Physical batch evaluated. |
| observed_at | datetime/null | no | — | Evaluation timestamp. |
| test_conditions.product_temp_c | number/null | no | °C | Measured ice-cream temperature at evaluation. |
| test_conditions.storage_age_hours | number/null | no | h | Age of batch at evaluation. |
| sensory.* | integer/null | no | 1–10 | Ordinal sensory rating. |
| notes | string/null | no | — | Free-text observations. |

### Sensory anchors

Use 1–10 consistently. v1 anchor definitions:

| Metric | 1 | 5 | 10 |
|---|---|---|---|
| sweetness | extremely low | balanced/moderate | extremely sweet |
| hardness | extremely soft | moderate | extremely hard |
| scoopability | impossible/poor | acceptable | effortless/ideal |
| creaminess | not creamy | moderate | exceptionally creamy |
| iciness | none | noticeable | extremely icy |
| gumminess | none | noticeable | extremely gummy |
| chewiness | none | moderate | extremely chewy |
| flavor_intensity | barely perceptible | moderate | overwhelming |
| meltdown | very slow | moderate | very fast |

Important: scoopability is directionally positive while hardness, iciness, and gumminess are descriptive intensity metrics. Do not combine these into a single composite score without an explicitly versioned model.

## Referential integrity

- Every `RecipeVersion.recipe_id` must match a Recipe.
- Every `RecipeVersion.ingredients[].ingredient_id` must match an Ingredient.
- Every `Batch.recipe_version_id` must match a RecipeVersion.
- Every `Batch.actual_ingredients[].ingredient_id` must match an Ingredient.
- Every `Observation.batch_id` must match a Batch.

JSON Schema alone does not enforce these cross-record foreign keys; enforce them in application/service validation.
