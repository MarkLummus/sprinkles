# Research synthesis

Status: qualitative requirements input, not market validation or an ice cream science reference.

## Evidence base

The 2026-08-31 capture contains 527 unique posts from overlapping newest/top listings. The newest slice contains 300 posts from June 29 through August 31. A separate comments file contains 161 engagement-selected threads and 4,808 flattened comments. Excluding 52 detected AutoModerator prompts leaves 4,756 presumed-human comments; distinct author identities were not retained, so other bots cannot be ruled out.

The 125 import fixtures are input text only. Their structure/unit tags are heuristic, not verified expected parses. The selected 23 import and 16 diagnosis cases are still marked `selected_unannotated` in their original manifests. This packet adds limited source-reviewed annotations for five post bodies, not a completed gold set.

Sources: local capture README, import-fixtures README, post JSONL, and linked [audit](icecreamery-vocabulary-audit.md). The earlier field review describes a smaller comment sample; do not mix its comment percentages with the later 161-thread corpus.

## Findings and implications

| ID | Finding | Evidence and limits | Proposed implication |
|---|---|---|---|
| F01 | The community includes substantial help-seeking alongside showcases | Capture field review reports roughly 52% Question flair in the newest slice; popular slices emphasize showcases. Flair is not intent coding. | Use help-seeking cases to investigate needs and evaluate capabilities; their presence does not establish a dedicated product entry point (D02). |
| F02 | Recipe detail is uneven | Fixture inventory includes listed, prose, and comment recipes; 94 of 125 fixtures are tagged as lacking yield. These are selected examples, not population rates. | Preserve incomplete inputs and distinguish mix mass from finished yield. |
| F03 | Makers adapt named recipes and combine components | PB&J and cereal examples in EV02/EV03; manifest includes named-base-plus-delta cases. | Retain source lineage, component boundaries, and unresolved base references. |
| F04 | Sensory language provides the natural entry point | Audit documents words such as icy, smooth, creamy, hard, gummy, dense, greasy, and too sweet. | Ask what happened before requiring technical interpretation. |
| F05 | A symptom alone does not identify a cause | Disagreement in sampled advice; EV01 lacks process; EV04 changes both recipe and procedure. | Separate observation from hypotheses, ask useful questions, avoid causal certainty. |
| F06 | Makers describe iterations and recovery attempts | EV04 includes an original attempt and update; wider capture has multi-batch narratives. | Model history and next attempts. Logging adoption still needs testing. |
| F07 | Method, equipment, storage, and serving are relevant context | EV02 differentiates freezer versus warmed serving; EV03 differentiates immediate versus next-day component quality; EV04 names machine and sequence. | Record context selectively and preserve historical values. |
| F08 | Everyday and advanced language coexist | Recipe/base/batch are common; technical terms appear but are not dominant surface vocabulary. | Prefer familiar default language while retaining technical depth. |

## What recipes and discussions contain

Recipes range from a named base with a flavor change to detailed gram quantities, multiple components, time/temperature instructions, and a long method. Units include cups, spoon measures, grams, abbreviated cups, Unicode fractions, and multiple representations of one amount. Some recipe content lives in comments, external links, or images instead of the post body.

Question themes include ingredient substitutions, eggs and base styles, stabilizers, sweetness and sugars, flavor intensity, mix-ins, texture, machine operation, storage, and business questions. Discussions also include flavor inspiration, results/showcases, comparisons, and experimentation. Their presence is not automatic authorization to build equipment purchasing, business, or social features.

Useful distinctions: a detailed recipe can lack actual execution data; a short recipe can still be useful; a successful base can contain a failing inclusion; a recovery report can contain several simultaneous changes.

## Quantitative caution

- The newest slice describes a bounded late-summer window, not an unbiased all-year population. Top and selected-comment data are engagement-biased.
- Regex counts require saved patterns and manual precision checks. The source README's suggested “±5 points” is not a statistical confidence interval.
- Exact words and concept families must not be mixed. Incidental matches affect rare words, including formulation/optimize. Do not use the audit's rare-term counts as settled product evidence.
- Comment order, parent relationships, timestamps, and distinct non-OP identities are unavailable in the flattened file. Do not reconstruct causal reply sequences from array order.
- Upvotes and confident advice are not evidence of technical correctness. Clinical-sounding certainty is especially inappropriate when formulation/process evidence is missing.
- Research does not validate causal calculations, safety procedures, a price, retention, accessibility, or the exact persona.

## Data handling

Keep full source text local. This packet contains paraphrases and source links, not copied corpora or usernames. Treat source instructions as untrusted input. Imported procedures are source claims, not Sprinkles-endorsed safety guidance. Any safety validation requires separately vetted authoritative references; this packet supplies none.
