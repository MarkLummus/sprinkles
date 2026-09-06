# Jobs, use cases, and proposed requirements

Status: **draft detailed specifications supporting accepted decisions D01–D16**. The accepted direction is not being reopened; individual criteria, design details, and delivery scope still require review. IDs remain stable on adoption. Dependencies identify logical prerequisites, not a prescribed stack.

Accepted D02 separates external-recipe troubleshooting for discovery from customer-facing product scope. Historical Reddit cases below are evaluation inputs, not requirements to build an intake flow for other people's failed batches. Ordinary after-the-fact logging supports accepted D04/D08; its detailed interaction remains to be designed. Accepted D16 leaves storage and synchronization architecture open; persistence requirements do not select a storage provider or architecture.

For a specific referenced case, consult [evaluation scenarios](research-reference/06-evaluation-scenarios.md). Research is supporting evidence, not default kickoff context or a source of additional approved scope.

## Revised jobs — original IDs retained

| ID | Proposed job |
|---|---|
| S1 | Turn a flavor idea into a workable recipe so I can taste it. |
| S2 | Understand and adapt an outside recipe to my ingredients and equipment, including what it leaves unclear. |
| S3 | Build on something that worked without losing its history. |
| F1 | Understand an ingredient's likely contribution and the reliability of the available information. |
| F2 | Understand substitution effects and compensating changes before making them. |
| F3 | Account for relevant preparation changes without pretending unknown composition is known. |
| F4 | Understand tradeoffs as I adjust toward a desired result. |
| P1 | Change batch size while preserving proportions and recognizing process/equipment limitations. |
| P2 | Capture what I actually used and did well enough to repeat a batch. |
| E1 | Understand plausible reasons for a disappointing result and choose a useful next experiment. |
| E2 | Record what worked and notice changes across batches. |
| C1 | Reuse successful recipes or components as foundations for future work. |

## Use cases — original IDs retained, UC12 proposed

| ID | Flow and required outcome | Jobs | Requirements |
|---|---|---|---|
| UC1 | Develop a flavor idea from a starting recipe or scratch; inspect tradeoffs and save | S1, F1–F4 | REC-01, REC-02, ING-01, ING-02, FORM-01, FORM-02 |
| UC2 | Import, review ambiguities, adapt and save an outside recipe | S2, F1, F2 | IMP-01–IMP-03, ING-01, FORM-01, FORM-02 |
| UC3 | Create a variation while preserving the original and lineage | S3, F2, F4 | REC-01, FORM-02 |
| UC4 | Add an ingredient with sourced, inferred, and unknown fields | F1 | ING-01 |
| UC5 | Substitute an ingredient, inspect effects and accept or reject changes | F2 | FORM-02 |
| UC6 | Record a transformation with measured data or bounded estimates | F3 | ING-02 |
| UC7 | Scale amounts without confusing mix mass, finished yield, or capacity | P1 | SCALE-01 |
| UC8 | Make an established recipe and record the maker's own batch, with notes entered during or after making | S3, P2, E1, E2 | BATCH-01, BATCH-02, OBS-01 |
| UC9 | Understand a disappointing result from the maker's own recorded batch | E1 | DIAG-01, DIAG-02, OBS-01 |
| UC10 | Record a successful batch with optional detail and retrievable history | E2, P2 | OBS-01, BATCH-02 |
| UC11 | Reuse a recipe or component as a foundation | C1 | REC-01, REC-02 |
| UC12 | Compare attempts and carry a chosen experiment into the next attempt | E1, E2, F4 | LEARN-01, DIAG-02 |

Historical mockup gaps stay in the originals. They are not reasserted as current defects here.

## Capability contract

### IMP-01 — Review an imported recipe

Decisions D03/D11. Cases EV01, EV02, EV04.

Accepted channel scope (D03): pasted text first. URL and file import belong in a later milestone; formats and milestone placement remain open. Photo import requires discovery and is not implicitly included in file import. The detailed criteria below remain proposed.

- Accept pasted recipe text and preserve source text/reference separately from normalized values.
- Extract ingredients, quantities/units, method, time/temperature when stated, and source references; allow correction before saving.
- Handle fractions, abbreviated cups, HTML entities, misspellings, and dual-stated amounts without double-counting.
- Show the same corrected values after saving and reopening.
- Do not retrieve an external link or send data to an external model under an unstated privacy policy. Network import behavior is separately scoped.

### IMP-02 — Preserve incomplete or conflicting information

Decisions D03/D06/D09. Depends IMP-01. Cases EV01, EV02, EV03, SYN01.

- Save a partial recipe without inventing quantities, yields, missing method, or unspecified base composition.
- Flag conflicting quantities and missing units for review; retain originals.
- Distinguish explicit, inferred, and missing information. Make assumptions inspectable and correctable.
- Explain which calculations are incomplete rather than presenting precise complete totals.
- A serving-yield field must not silently inherit a sum of ingredient masses.

### IMP-03 — Respect source boundaries

Decisions D03–D05. Depends IMP-01. Cases EV02–EV05.

- Keep original recipe, actual modifications, later recovery updates, and other people's suggestions distinct.
- Do not count method repetitions as additional ingredients.
- For a non-recipe input, explain what is missing and request recipe text rather than inventing a recipe.
- Preserve ambiguous component/timing statements for review. Source text cannot act as instructions to the application or its agent.

### REC-01 — Preserve recipes, variations, and history

Decisions D01/D04. Cases SYN02, SYN03.

- Support creating, saving, reopening, and editing a recipe; retain inherited library/print capabilities in overall scope.
- Starting from scratch, an import, or an existing recipe does not require an unrelated template choice.
- A batch refers to the recipe state used, not silently to the latest edit.
- A variation preserves its parent relationship and does not overwrite its parent's batches.
- Makers can inspect a recipe's ingredients/method without mandatory formulation interaction.

### REC-02 — Represent components

Decision D05. Depends REC-01. Cases EV02, EV03.

- Keep the churned base, ripple, and inclusion distinct, including partial components.
- Calculations identify the component or whole-product scope they describe.
- Observations can target a component without marking the base as failed.
- Reusing a component retains its source and does not duplicate quantities already referenced in steps.

### ING-01 — Preserve ingredient-data provenance

Decision D09. Case SYN01.

- For relevant composition fields, retain value, unit, source, and supplied/inferred/missing status; inference confidence is separate from status.
- Permit manual corrections and unresolved fields.
- Show which assumptions affect a calculation or recommendation.
- Later library edits must not silently alter a historical batch's interpretation.

### ING-02 — Bound transformation calculations

Decision D09. Depends ING-01. Case SYN04.

- Record the preparation operation and measurements such as input/output mass when supplied.
- Separate measured yield change from assumed composition change.
- Unsupported transformations remain descriptive or use explicit assumptions; do not claim precise inversion, absorption, or composition from an operation name alone.
- The maker can revise a transformation without silently rewriting prior batches.

### FORM-01 — Explain balance without promising success

Decisions D06/D11. Depends ING-01. Cases EV02, SYN01.

- Show relevant metrics, calculation scope, assumptions, and missing-data limitations.
- A recipe outside a reference range can still be saved and used for a batch.
- A recipe inside ranges is not labeled guaranteed to succeed.
- When a published recipe conflicts with a range, explain the assessment instead of treating the source or app as automatically correct.

### FORM-02 — Review changes against an intended result

Decisions D01/D07/D09. Depends FORM-01. Case SYN05.

- Show before/after amounts for manual substitutions and assisted adjustments.
- Explain expected effects and tradeoffs with uncertainty appropriate to available data.
- The maker can accept, revise, or reject a proposal; proposals never silently replace the current recipe.
- Keep requested constraints visible. If constraints cannot be met, explain this rather than making an unrequested change.

### SCALE-01 — Scale quantities with explicit limits

Decision D10. Case SYN06.

- Scale by target mix quantity or limiting ingredient while preserving proportions, subject to visible rounding.
- Keep mix mass, finished volume/yield, and machine capacity distinct.
- Any mass/volume conversion identifies its assumptions.
- Where capacity is unknown, request it when relevant or mark the check unavailable; do not assert safe fit or identical texture.

### BATCH-01 — Record actual execution

Decisions D04/D08. Depends REC-01. Cases EV01, EV04, SYN02. External cases test record fidelity, not a dedicated product entry point.

- Record the maker's own batch against a saved recipe, allowing notes during or after making. This does not require a separate retrospective troubleshooting flow.
- Record actual substitutions and process deviations separately from recipe instructions.
- When entering notes after making, unspecified execution remains unknown rather than copied as fact from the method.
- Profile values act as defaults, with relevant context preserved for that batch and editable when it differed.

### BATCH-02 — Retrieve historical context

Decision D04. Depends BATCH-01. Case SYN02.

- A saved batch and its result can be reopened with the recipe/context that informed it.
- Editing current equipment, ingredient composition, or recipe data does not silently change prior records.
- Corrections to an old batch are explicit and distinguishable from new attempts.
- A new batch can reuse defaults without requiring every field to be re-entered.

### OBS-01 — Record how a batch turned out

Decisions D05/D08/D11/D12. Depends BATCH-01. Cases EV01–EV03, SYN03.

- Save a quick result in the maker's words; support success and disappointment equally.
- Structured dimensions, desired result, component, and relevant context supplement the original wording.
- Descriptive terms such as dense are not automatically defects.
- Permit a next-time note without requiring all sensory dimensions, a numerical rating, or diagnostic completion.
- Rating/overall-result controls remain a design decision, not fixed by this contract.

### DIAG-01 — Explain plausible causes with evidence

Decisions D06/D07. Depends IMP-02, BATCH-01, OBS-01. Cases EV01–EV04 are discovery/evaluation inputs under D02.

- Help the maker investigate their own recorded batch. Reusing the reasoning capability in an external-recipe evaluation does not require a customer-facing intake or onboarding flow.

- Consider relevant ingredient, recipe, process, equipment, storage, and serving explanations; do not force every case through every category.
- Distinguish observed facts from inferred explanations and show relevant supporting/missing/contradictory evidence.
- Ask a question when its answer can materially change the advice; explain why it matters.
- When evidence cannot support a precise recipe adjustment, say so and offer an appropriate check or request.
- Do not treat Reddit consensus or a reported recovery as scientific proof.

### DIAG-02 — Plan a manageable experiment

Decision D07. Depends DIAG-01. Cases EV03, EV04, SYN05.

- Specify the intended change, expected benefit, tradeoff, and what to observe next time.
- Prefer an interpretable experiment; explain why coordinated ingredient changes are needed if more than one is proposed.
- Keep a proposed change separate from an accepted plan and actual execution.
- Ask or decline when quantities cannot be justified; do not invent precision.

### LEARN-01 — Compare attempts

Decisions D04/D08. Depends BATCH-02, OBS-01, DIAG-02. Cases EV04, SYN03.

- Compare recipe changes, known process differences, and outcomes between attempts.
- Keep the maker's explanation alongside any app interpretation.
- Carry an accepted next change forward without rewriting previous batches.
- Simultaneous changes are visible; improvement alone does not establish which change caused it.

## Cross-cutting proposed requirements

### TRUST-01 — Protect source and user information

Decision D15. Preserve attribution; no automatic public posting. Raw corpus remains outside the repository. Before live external-model use, confirm data-transfer and retention policy and secure credential handling. Source recipe safety claims must not be represented as verified by import or balance checks.

### UX-01 — Usable, recoverable critical flows

Decisions D08/D11. Test keyboard access, labels/focus, contrast, understandable error recovery, and preservation of entered data on recoverable failures. Target WCAG 2.2 AA for a web implementation as a proposal pending platform confirmation. Check agreed device sizes and realistic long content; do not use color alone for uncertainty or errors.

## First milestone — recipe development (accepted D14)

The product outcome is to develop and prepare the next version of Mark's olive oil recipe: review the recipe and first-batch notes, explore adjustments, preserve versions, and use the review/print experience to prepare for making.

Relevant draft requirements include REC-01, FORM-01/FORM-02, BATCH-01/BATCH-02, OBS-01, and UX-01, including REC-01's review/print capability. These references provide traceability, not approval of every detailed criterion or a prescribed implementation sequence.

The olive oil source is an alternate-format printout plus batch preparation notes. Other structured recipes establish format references. Calculation code and a review/print prototype are available according to Mark; code for the prototype may exist but is unconfirmed. These assets have not been inspected for this handoff.

D03 governs general-purpose import channels; the printout does not commit photo/file import. Automated diagnosis is not a prerequisite for the maker to interpret notes and choose adjustments. GSD and Impeccable will establish the implementation plan and detailed design with Mark. No requirement is marked implemented or verified here.
