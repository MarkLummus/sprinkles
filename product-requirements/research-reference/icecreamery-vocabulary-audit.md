# r/icecreamery Vocabulary Audit

Reference status: historical research audit, retained for evidence checks only. Its product-language suggestions are not active requirements. Use the current [decision register](../03-decision-register.md) and [domain/language guide](../05-domain-and-language.md) for product decisions; do not follow references to archived documents as kickoff instructions.

**Audit date:** 2026-08-31  
**Source capture:** `/Users/mark/Downloads/sprinkles-icecreamery-capture/`  
**Purpose:** determine which vocabulary findings are supported by the captured corpus and
which claims require narrower wording, hand-coding, or product testing.

## Outcome

The capture is sufficient for an evidence-backed vocabulary study and for selecting
realistic import and diagnosis cases. A broad recapture is not needed.

The strongest supported product finding is:

> Start with the outcome the maker perceived, then reveal formulation, process,
> equipment, and storage evidence as possible explanations.

The corpus does **not** support mapping each perceived outcome cleanly to one calculated
composition metric. Vocabulary and causality must remain separate models.

## Corpus integrity

| Asset | Reported | Verified | Notes |
|---|---:|---:|---|
| Posts | 527 | 527 | Full title and body in JSONL |
| Comment threads | 161 | 161 | Selected by engagement |
| Comments | 4,808 | 4,808 | Flattened within each thread |
| AutoModerator prompts | 52 | 52 | Repeated recipe/outcome prompt |
| Human comments after exclusion | 4,756 | 4,756 | Matches vocabulary report |
| Import fixtures | 125 | 125 | Raw fixtures are stored in the zip archive |

The comments retain body text, score, and whether the author was the OP. They do not
retain comment IDs, dates, parent relationships, or distinct non-OP identities. This is
enough for document-frequency vocabulary analysis, but not for reconstructing reply
chronology or measuring which diagnosis changed the discussion.

## Sampling implications

- Use the 300-post `newest` slice for current base rates. It is a consecutive window from
  2026-06-29 through 2026-08-31.
- Use `topMonth`, `topYear`, and `topAll` to study visible/high-engagement language, not
  prevalence. These slices oversample photo and showcase posts.
- Comment findings describe 161 engagement-selected threads. They likely overstate the
  helpfulness and technical depth of a typical quiet thread.
- The newest slice is late-summer only; fruit and sorbet language may be seasonal.

## Count audit

The published analysis mixes exact surface-form counts with broader concept-family
claims. Those should be distinguished in any future report.

| Concept | Published count | Independent exact-form check | Broader family check | Audit conclusion |
|---|---:|---:|---:|---|
| `recipe` | 178 posts | 179 | 205 for `recipe/recipes` | Strongly dominant; exact total needs pattern disclosure |
| `base` | 159 | 159 | 161 for `base/bases` | Reproduces |
| `batch` | 44 | 44 | 53 for `batch/batches` | Reproduces as singular surface form |
| `formula/formulation` | 3 | 5 | 5 | Rare, but not three in the frozen corpus |
| `smooth` | 29 comments | 29 | 37 incl. smoothness/comparatives | Reproduces as exact surface form |
| `creamy` | 35 | 35 | — | Reproduces |
| `icy` | 33 | 33 | — | Reproduces |
| scoopable/scoopability | 14 | 14 | — | Reproduces |
| gummy/chewy/stretchy/slimy | 13 | 13 | — | Reproduces |
| dense | 12 | 12 | — | Reproduces |
| overrun | 23 comments | 23 | — | Reproduces |
| “came out” / “turned out” | 29 posts | 44 | — | Published number does not reproduce from the stated corpus |
| `next time` | 9% of substantive posts | 19 of 374, or 5.1% | 23, or 6.1%, under the README's wider iteration flag | Retain the phrase finding; correct the percentage |
| Optimize in formulation sense | absent | 1 clear post | — | “Absent” should be “almost absent” |

The rare-term discrepancies do not overturn the language recommendations. They do mean
the report should publish its exact patterns and avoid treating a surface-form count as
the complete prevalence of a concept.

## Findings safe to use in product decisions

### Strongly supported

- **Recipe** is the default reusable object.
- **Base** means both an unflavored mix and a named starting recipe.
- **Batch** means one execution of a recipe.
- **Churn** is the dominant conventional-machine verb.
- Makers describe results with outcome words such as **icy, creamy, smooth, scoopable,
  hard, gummy, grainy, dense, greasy**, and **too sweet**.
- **Came out / turned out** is natural framing for a batch result.
- **Next time…** is natural forward-looking iteration language, even though the reported
  9% prevalence is overstated.
- Ingredient matching must be alias-aware and ambiguity-aware.
- **Balance**, **ratio**, **stabilizer**, and **calculator** are recognized terms.
- PAC, POD, MSNF, draw temperature, aging, pasteurization, and overrun should not be the
  only primary labels for general users.

### Supported as hypotheses requiring UI testing

- Replace **Template** with **Base recipe** in every context.
- Replace **Scale** with **Make more / less** rather than the clearer **Change batch size**.
- Replace **Optimize**; the corpus shows rarity, not lack of comprehension.
- Coin a positive opposite for gummy body. Recognition cannot be inferred from absence.
- Treat the AutoModerator prompt as a validated field specification. It is strong
  community evidence, not usability validation.

### Not supported as causal claims

- Creaminess is determined by total solids.
- Graininess is determined by MSNF/lactose.
- Density belongs on a fat/richness axis.
- Greasiness is simply excessive richness.
- Gumminess is determined only by stabilizer quantity.
- Each sensory outcome maps cleanly to a composition metric.

These outcomes can also depend on ingredient variability, preparation, machine behavior,
freezing rate, hardening, temperature cycling, and serving temperature.

## Corrections to the translation table

| Internal term | Product-safe primary language | Advanced detail |
|---|---|---|
| PAC | How hard it freezes | PAC / freezing-point depression |
| POD | Sweetness | POD |
| Total solids | Solids; explain effects contextually | Total solids % |
| MSNF | Milk solids (not fat) | MSNF % |
| Overrun | Air; how airy or dense | Overrun % |
| Draw temperature | Temperature out of the machine | Draw/extraction temperature |
| Emulsifier | Helps fat and water stay mixed | Emulsifier; examples include yolk and lecithin |
| Stabilizer | Stabilizer or gums | Blend and percentage |
| Pasteurize | Heat the base; show recipe-specific time and temperature | Pasteurization treatment |
| Aging | Rest/chill the base | Aging time |
| Formulation | Recipe or base in default UI | Formulation in advanced contexts |
| Scale | Change batch size | Scale factor |

Do not translate MSNF to “milk powder”: milk and cream also contribute milk solids. Do
not translate emulsifier directly to “egg yolks” or “lecithin”: those are examples of
ingredients that perform the function.

## Research assets derived from this audit

- The original `sprinkles-outcome-language-model.md` is archived. The active
  [domain/language guide](../05-domain-and-language.md) supplies product guidance.
- `icecreamery-import-gold-set-plan.csv` selects a stratified seed set for hand-coded
  expected imports.
- `icecreamery-diagnosis-gold-set-plan.csv` selects troubleshooting cases for diagnostic
  annotation and response evaluation.

## Remaining work before quantitative claims are published

1. Save the exact patterns used for each count.
2. Hand-code a sample of outcome terms to estimate precision and missed synonyms.
3. Compare the newest slice with older/top slices for vocabulary drift.
4. Test recognition of candidate UI labels; production frequency alone does not prove
   whether a label is understood.
5. Keep the raw corpus local. Do not commit usernames or full Reddit bodies to the product
   repository without a separate retention and sharing decision.
