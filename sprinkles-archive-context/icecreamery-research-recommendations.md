# r/icecreamery Research Recommendations

These are recommendations derived from the r/icecreamery vocabulary, import, and
troubleshooting research. They are intentionally separate from the committed Sprinkles
todo list until the product decisions are accepted.

## Import evaluation

- Use `icecreamery-import-gold-set-plan.csv` as a stratified seed set of real community
  recipes.
- Hand-code expected output before treating any fixture as a scored test.
- Grade:
  - recipe name and type
  - components
  - ingredients and preparation modifiers
  - quantities and units
  - yield
  - method
  - temperatures and times
  - source/base references
  - ambiguities that require confirmation
- Keep raw Reddit bodies outside the product repository. Store only derived expectations,
  Reddit IDs, and source URLs in the project.

## Batch-result language

- Use the dimensions and primary/advanced terminology in
  `sprinkles-outcome-language-model.md`.
- Preserve the maker's original description alongside normalized outcome fields.
- Keep observation separate from diagnosis: an outcome such as `icy` does not prove a
  formulation cause.
- Consider replacing the star rating with an overall result:
  - As intended
  - Close
  - Needs another batch
- Capture structured outcome fields and an optional `Next time…` note.

This is a proposed product change, not yet a settled requirement. It should be compared
against retaining the current star rating as an overall sentiment signal.

## Diagnostic evaluation

- Start evaluation with `icecreamery-diagnosis-gold-set-plan.csv`.
- For each case, record:
  - ranked hypotheses
  - supporting evidence
  - contradicting or missing evidence
  - confidence
  - one proposed test or change
  - expected benefit
  - tradeoff
- Evaluate whether the system asks for missing information rather than manufacturing a
  precise diagnosis.
- Include cases where a recipe validates cleanly but the batch fails because of process,
  equipment, hardening, storage, or serving conditions.

## Open decisions

- Whether **Base recipe** should replace **Template**, and in which contexts.
- Whether **Optimize** remains the action label or becomes **Adjust balance**,
  **Rebalance**, or another term.
- Whether star ratings remain alongside structured outcomes.
- Which batch/process fields are mandatory before a diagnostic recommendation is shown.
- How confidence and competing explanations are presented.
