# Domain and language guide

Status: shared domain and language guidance aligned with accepted D04–D11. Detailed representations remain subject to design review. This is not a database schema or a final set of interface labels; D12 preserves the explicitly open label and rating choices.

## Core records

| Concept | Meaning and required distinction |
|---|---|
| Source | Text/reference from which information came; retain attribution and location where practical. |
| Recipe | Reusable ingredients, components, and intended method. |
| Recipe version | Preserved recipe state referenced by an attempt. Storage implementation is open; historical stability is required. |
| Component | Base, ripple, sauce, inclusion, or other separately prepared part; may itself be reusable. |
| Ingredient specification | Identity and relevant composition, with per-field provenance and uncertainty. |
| Batch | One actual attempt using a recipe state, including known deviations and historical equipment/process context. |
| Observation | What the maker experienced, including original wording, component, timing/context, and desired result where known. |
| Hypothesis | A possible explanation supported or limited by evidence; never the same record as an observation. |
| Next experiment | A proposed or accepted future action, with intended benefit and tradeoff; not proof it was executed. |

Recipe → version → batch → observations is a useful relationship, not a mandatory navigation hierarchy. A hypothetical recipe question need not fabricate a completed batch. Represent unknowns without fake dates or settings.

## Data invariants

- Preserve original quantity text alongside normalized amount/unit and conversion basis.
- Keep source-stated, inferred, and missing values distinguishable. Confidence is not a substitute for source status.
- Multiple units for one amount are alternative representations, not additional ingredients. Conflicting conversions require review.
- Source recipe instructions, reported actual process, and advice have different roles.
- A portion of an ingredient used during a step does not increase the recipe total.
- A named base reference is not sufficient evidence to fill in its ingredients from memory.
- Store historical context or an equivalent immutable reference. Joining old batches only to mutable current profiles violates BATCH-02.
- Corrections to history are explicit. Adding information later is not evidence it was known at the time.
- Ingredient mass, mix mass, finished volume, portion count, and machine capacity are distinct quantities.

## Preferred vocabulary

| Prefer in ordinary language | Technical detail / caution |
|---|---|
| Recipe | Formulation is appropriate in advanced contexts, not a compulsory primary label. |
| Base / base recipe | Use for the underlying mix or reusable starting recipe; not every template or flavored recipe is a base. |
| Batch | One attempt, not a recipe synonym. |
| Method; what you did | Distinguish intended steps from actual execution. |
| How did it turn out? | Preserve the answer rather than forcing an immediate diagnosis. |
| Next time… | Maker's intention; distinguish from the app's recommendation. |
| Sweetness | POD is a model of relative sweetening effect, not a complete sensory verdict. |
| Freezing behavior | Explain PAC/freezing-point depression; do not equate PAC alone with measured hardness or scoopability. |
| Milk solids other than fat | MSNF; not synonymous with milk powder. |
| Air / airy or dense | Overrun is a technical measure, not simply a preference score. |
| Temperature out of the machine | Draw/extraction temperature, when relevant to the equipment. |
| Rest/chill the base | Aging; retain actual time/temperature and do not assume every rest has the same effect. |
| Heating step | Do not label arbitrary heating as validated pasteurization. |
| Stabilizer; emulsifier | Distinct functions; ingredients may serve several roles. Do not rename all emulsifiers “egg yolks.” |

Do not infer ingredient equivalence from a name alone: cream fat percentage, milk-powder type, glucose syrup composition, and product variants can matter. Match aliases while preserving modifiers and uncertainty.

## Observation vocabulary

Support these dimensions internally; do not present them as ten mandatory questions:

| Dimension | Example words / distinctions |
|---|---|
| Ice texture | Smooth, icy, coarse, crystals; distinguish from non-ice particles. |
| Hardness / scoopability | Too soft, slushy, firm, rock hard; serving conditions matter. |
| Body / elasticity | Thin, thick, gummy, chewy, stretchy; preference is separate. |
| Air / density | Airy, fluffy, dense, heavy; dense can be intended. |
| Fat perception | Rich, greasy, oily, waxy, buttery; not one continuous axis. |
| Grain / particles | Grainy, gritty, sandy, chalky; not proof of lactose crystallization. |
| Sweetness | Too little, as wanted, too sweet, cloying. |
| Melt | Watery, frothy, fast melt, holds shape, separates. |
| Flavor | Weak, muted, strong, bitter, tart, eggy, aftertaste. |
| Component texture | Crunchy, soggy, frozen hard; attach to the relevant inclusion/ripple. |

“Creamy” is a useful original description but may combine several qualities. Ask what the maker means only when that distinction affects the next step. Directions and severity are optional and only meaningful in some dimensions.

## Diagnostic voice

Preferred order: observed result → plausible explanation/evidence → useful check or change → expected benefit/tradeoff.

Illustrative copy, not final UI: “There isn't enough information yet to separate a recipe issue from a churning issue. What machine did you use, and what happened while it churned?”

Avoid “Your recipe is correct,” “This will fix it,” “In my experience,” and explanations that equate one sensory word with one metric. Do not automatically prefer process explanations just because composition falls inside ranges.

## Labels still open

Stars vs overall result controls; Optimize vs Adjust balance; Scale vs Change batch size; Template vs Base recipe in particular contexts. Test understanding and task success. Community word frequency alone cannot choose them.
