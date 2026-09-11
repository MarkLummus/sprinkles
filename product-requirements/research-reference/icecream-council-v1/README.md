# Ice Cream Council Data Contract v1

Files:

- `icecream_council_v1.schema.json` — JSON Schema Draft 2020-12
- `DATA_DICTIONARY.md` — field definitions, units, semantics, and sensory anchors
- `IMPLEMENTATION_GUIDE.md` — architectural rules, validation layers, versioning, and integration guidance
- `example_payload.json` — illustrative full payload

Key rule: recipe intent, physical batch execution, and sensory observations are separate entities. Calculated formulation values are derived, versioned state and must never overwrite source data.
