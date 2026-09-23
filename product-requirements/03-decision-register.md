# Decision register

**D01–D18 are accepted.** D14 establishes the first product milestone's outcome, not its implementation plan. Acceptance does not mark implementation complete. Framework choice (GSD for delivery; Impeccable for design/branding) is user-confirmed, but exact GSD distribution is unresolved.

| ID | Accepted decision | Basis | Consequence / tradeoff |
|---|---|---|---|
| D01 — Accepted | Retain the full develop–make–learn product; define serious enthusiasts by motivation, with precise persona attributes unvalidated | Original jobs; F01/F08 | Broader than a clinic, but not every subreddit audience is in scope. |
| D02 — Accepted as revised | Use troubleshooting of external recipes as a discovery and evaluation workflow, not a dedicated customer-facing entry point | Mark's clarification; discovery pilot; F01/F05 | Reuse product capabilities where useful; specialized product behavior requires evidence of an actual user need. Ordinary after-the-fact batch logging is considered separately under D04/D08. |
| D03 — Accepted | Make pasted-text import and explicit unknowns a reliable initial path; deliver URL and file import in a later milestone; investigate photo import before committing | F02; Mark's channel sequencing decision | Useful partial records are allowed; some calculations remain unavailable. URL/file milestone placement and file formats remain open. Photo import is discovery, not committed delivery scope. |
| D04 — Accepted | Separate recipe, version, actual batch, observation, and proposed next attempt; preserve historical context | F06/F07 | More model structure, but editing a recipe/profile cannot rewrite the past. |
| D05 — Accepted | Represent base, ripple, sauce, and inclusion boundaries | F03; EV02/EV03 | Component-aware calculations and observations; not all solids belong in the churned mix. |
| D06 — Accepted | Treat balance as an assessment under assumptions, not a gate or guarantee | F05/F07 | Warnings remain visible, but saving/making outside ranges is possible. |
| D07 — Accepted | Troubleshoot with evidence, alternatives, targeted questions, and manageable experiments | F05 | May withhold a precise recipe change; controlled experiments can require coordinated ingredient changes. |
| D08 — Accepted | Make success and disappointment part of the same lightweight batch history | F06 | Optional detail and targeted follow-up; no mandatory ten-axis survey. |
| D09 — Accepted | Preserve ingredient provenance and bounded transformation estimates | F02/F05; original F1–F3 | Unknown composition stays unknown; no automatic universal chemistry model. |
| D10 — Accepted | Scale proportions while distinguishing mix mass, finished yield, and capacity | F02/F07; original P1 | Must communicate conversion/process uncertainty. |
| D11 — Accepted | Use familiar words by default without concealing advanced detail | F04/F08 | Technical numbers remain accessible; plain wording must not overstate prediction. |
| D12 — Accepted | Leave stars, Optimize, Scale, and Template labels open until relevant design testing | Conflicting source docs; term frequency ≠ comprehension | Do not automatically remove stars or globally replace Template with Base recipe. |
| D13 — Accepted | Preserve existing branding as incumbent evidence; confirm its authority before expansion or replacement | Existing design todos | No new visual identity inferred from community research. |
| D14 — Accepted as revised | Prioritize recipe development, using the in-progress olive oil recipe to review the recipe and first-batch notes, explore adjustments, preserve versions, and prepare the next recipe through the review/print experience | Mark's current recipe-development work and available assets | Olive oil source is an alternate-format printout plus batch prep notes; other structured recipes establish format references. This does not commit photo/file import. Implementation belongs to GSD and Impeccable. |
| D15 — Accepted | Use a manual, reviewed import-and-advice pilot with follow-up when available | User proposal; EV01–EV05 | Evaluate usefulness before claiming automated effectiveness. No automatic posting or publication of source data. |
| D16 — Accepted | Keep storage and synchronization architecture open | Mark's storage research and clarification | No commitment to local-only, local-first, cloud-based storage, or Google Drive sync. |
| D17 — Accepted | Connected workspaces, gram-governed Notebook, original-unit imports, and approved product vocabulary | Mark's approval, 2026-09-19 | Preserve recipe/version/batch relationships; Adapt follows maker intent; Sheet and Recipe Sheet are synonymous; delivery scope remains separate. |
| D18 — Accepted | Sprinkles distinguishes assets from processes | Mark's approval, 2026-09-23 | Assets are kept and reused; processes change them and leave a dated record citing the exact asset state used. The two stay distinguishable and are joined deliberately. Internal framing; not interface labels. |

Research identifiers F01–F08 refer to the [research synthesis](research-reference/02-research-synthesis.md); EV/SYN identifiers refer to [evaluation scenarios](research-reference/06-evaluation-scenarios.md). Consult those only when reviewing the supporting evidence. References to original jobs or design todos record historical rationale, not instructions to load archived documents or override accepted decisions.

## Specific choices still open

D17 below settles the connected workspaces, measurement domains, and vocabulary on 2026-09-19. D01–D16 remain accepted; D17 narrows D12's open Template/Base terminology without deciding ratings or the Optimize/Scale labels.

| Choice | Recommended starting point | Needed before |
|---|---|---|
| First milestone planning | Recipe-development outcome is accepted under D14. Detailed design, technical sequencing, and delivery plans belong to the GSD and Impeccable workflows. | Framework planning and design approval |
| Later import channels | Pasted text first is accepted. Assign URL and file import to a later milestone and define file formats. Investigate photo import before a delivery commitment. | Later import milestone planning; photo discovery review |
| Platform/stack/deployment | Inspect existing project and ask only material unknowns | Native framework initialization/build |
| Supported equipment | Define initial conventional-machine scope and handling of other processes | Process schema and design brief approval |
| Stars vs overall outcomes | Test outcomes alone versus outcomes plus optional rating | Batch logging design approval |
| Base/adaptation implementation | D17 settles meaning and the Adapt action; persistence and interaction details remain to be shaped | Recipe-library implementation planning |
| Brand authority | Review existing cone/scoop/slate-blue work with Mark | Visual direction approval |
| Privacy/service policy | Decide external model data transfer, retention, and credentials handling | Live AI integration |
| Evaluation thresholds | Establish baseline, then approve tolerances; fabricated quantities are a critical failure | Release gate definition |

## Conflicts that frameworks must not silently settle

- Original JTBD/UC9 assume every batch was validated. Accepted D06 treats balance as an assessment rather than a gate; D02 does not establish a customer-facing retrospective troubleshooting flow.
- D02 limits external-recipe troubleshooting to discovery/evaluation. Historical cases and ordinary after-the-fact notes must not be interpreted as approval of a dedicated retrospective troubleshooting product flow.
- Outcome model says “Avoid star ratings”; research recommendations leave stars open. D12 preserves the question.
- Original todos say profile constants are joined at analysis time and never re-asked. Accepted D04 requires historical context to be preserved; mutable profile values must not silently rewrite old batches.
- Original instructions require template starts, despite a designed scratch option. D01/D03 retain multiple entry paths.
- Original handoff includes cleanup instructions, proxy effort estimates, and a numerical aggregation threshold. None is a current action authorization or verified technical requirement.
- The outcome model's PAC-to-hardness phrasing and balance-first diagnostic example are too strong if taken literally. The language guide makes their limits explicit.

## Adoption rule

When Mark approves a decision, record date, status, and any conditions here. Promote only the associated approved requirements to GSD scope. If implementation or design exposes a needed change, propose it here before altering the capability contract. A dated approval record—not framework-generated completion—is the authority.

## Completed Decisions

### D18 — Assets and processes

**Status:** Accepted

**Date:** 2026-09-23

**Owner:** Mark

**Scope:** Product model and design framing; no interface labels, no milestone expansion or implementation claim

**Decision:** Sprinkles holds two kinds of things. **Assets** are what a maker keeps, reads, and builds from: a Recipe and its versions (each presented as a Sheet), Bases, Ingredients, Kitchen equipment and setups, and Ideas. **Processes** are what happens to or with assets: making (a Batch and its Tastings), Import, Adapt, Next version, Develop in Notebook, Add to Recipe Book, and Ask an expert. A process happens at a time and leaves a **record**: the process, its date, and the exact asset state it used or produced (the Batch's version and coefficient snapshot, Adapted from, Why and From batch, the Source and Original quantity, the Conversion basis, the selected version, the Consultation).

**Consequences:**

1. Assets change only through a process. The exception is correcting an asset's own identity (renaming a Recipe, Save over on an unchurned version), which rewrites no record.
2. A record is never rewritten by a later change to an asset; it keeps citing the state it used (D04, D09).
3. Assets and processes stay distinguishable, but not necessarily separate. A process's evidence may be shown in the context of the asset it concerns when that aids understanding, and stays marked as the process's own. The batch in view's as-made grams and Method changes sit on the Sheet in pen blue against the black plan, while the rest of the batch record is App context. In print, a process can appear as blank space for the pen (DESIGN.md Context Boundary Rule).
4. "Asset" and "process" are design and data framing, not interface labels (D11). The maker sees the grammar instead: a dated record and a clear "made from" or "from".

**Rationale:** Named by Mark while separating the recipe record from the Sheet (GSD Phase 03.5): the Sheet is a resource the maker keeps; a batch and its tastings are a process that happened. The same shape already governs D04's recipe/version/batch separation and D17's lineage terms, and extends to Import and Adapt.

**Open questions:** Whether each process gets a first-class record type or some (Add to Recipe Book, Develop in Notebook) record only as fields on the asset they change; decided when each process is shaped. D16's storage question stays open.

**Affected artifacts:** PRODUCT.md (Product Principle 7); domain guide; DESIGN.md Context Boundary Rule; recipe surface brief (`route-recipe.md` § "03.5 revision").

### D17 — Connected workspaces, measurement domains, and approved vocabulary

**Status:** Accepted

**Date:** 2026-09-19

**Owner:** Mark

**Scope:** Product model and user-facing language; no milestone expansion or implementation claim

**Decision:** Idea log captures possibilities; Notebook develops recipes in grams; Recipe book holds ready-to-make recipes and bases in original volume, weight, or mixed units or as selected Notebook versions. These are connected views and activities. Add to Recipe Book selects a particular version without moving, duplicating, or ending its development history. Later work never silently replaces that selection. Batches retain one meaning and history across all entry points, without requiring development mode to record a batch.

Import preserves original quantities, attribution, and conversion basis. Develop in Notebook makes gram conversion deliberate and reviewable, with uncertainty visible. Conversion alone does not decide recipe identity. **Adapt** starts a distinct recipe from a specific version; **Next version** continues the same recipe. Maker intent decides. **Base** is a reusable recipe role, including imported volumetric recipes; publication and popularity do not define it.

**Recipe Sheet** and **Sheet** are synonymous presentations of a version, including reading, editing, and printing. Recipe name/description belong to the enduring identity; Sheet title/description belong to the version and remain historically stable. Version name and Why identify and explain the revision. The complete approved vocabulary is in `05-domain-and-language.md`, including Draft, Sources, Ingredients, Kitchen, and AI-assisted Ask an expert / Consultation. “Sprinkles Jar” is retired as interface and active design terminology; use recipe context and actual section names.

**Rationale:** Preserve the maker's distinction between ideas, development, and dependable recipes, and between recipe identity, printable content, actual attempts, and proposed changes. Naming preferences are Mark's design decisions, not conclusions established by community research.

**Open questions:** Detailed schema, migration, Home composition, import delivery, Kitchen setup support, AI integration and data-sharing policy, and sourcing/permissions for a published-base collection. The two Home mocks remain contenders. No consultation service or external data transfer is authorized by this decision.

**Affected artifacts:** PRODUCT.md; product brief; domain guide; proposed requirements; framework handoffs; shell, recipe, version, and print surface briefs. GSD delivery scope remains separately approved.

### D01 - Retain the full develop–make–learn product; define serious enthusiasts by motivation, with precise persona attributes unvalidated

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Product purpose and target audience

**Decision:** Retain the full develop–make–learn product; define serious enthusiasts by motivation, with precise persona attributes unvalidated.

**Rationale:** Preserve the original jobs across recipe development, making, and learning. Research findings F01/F08 support accommodating help-seeking and different levels of technical vocabulary without reducing the product to a troubleshooting clinic or assuming every subreddit audience is in scope.

**Open questions:** Precise persona attributes remain unvalidated. This decision does not settle the first milestone or approve the other proposed capabilities.

**Revisit trigger:** Direct user research or pilot evidence that challenges the motivational audience definition or the value of the full develop–make–learn loop.

**Affected artifacts:** Product brief; jobs and use cases; product context supplied to GSD and Impeccable.

**Alignment:** Acceptance recorded in this register. The product brief already expresses this direction. No other decision, requirement status, or implementation scope was changed by this acceptance.

### D02 — Use external-recipe troubleshooting for discovery and evaluation

**Status:** Accepted as revised  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Discovery and evaluation; boundary with customer-facing product scope

**Decision:** Use troubleshooting of external recipes as a discovery and evaluation workflow. It does not establish a dedicated customer-facing troubleshooting entry point or onboarding flow. Reuse product capabilities where useful; introduce specialized product behavior only when an actual user need warrants it.

**Rationale:** Importing another maker's recipe and investigating their result can test import, calculations, and advice. The usefulness of that exercise does not establish that it is a common product workflow for Mark or the target audience.

**Open questions:** Ordinary after-the-fact logging of a maker's own batches is addressed under accepted D04/D08. This decision does not remove troubleshooting of the maker's own recorded batches from the develop–make–learn product. D15's manual pilot approach is accepted; specific evaluation procedures still require planning. D14 establishes the first product milestone's outcome.

**Revisit trigger:** Direct user evidence that bringing previously unrecorded, disappointing batches into Sprinkles is a recurring need that warrants a dedicated product flow.

**Affected artifacts:** Product brief's primary journeys and first-release scope; UC8/UC9 and BATCH-01/DIAG-01 in the proposed requirements; framework brief seeds and milestone guidance; research implications describing retrospective troubleshooting as a product entry point.

**Alignment:** Reconciled across the handoff packet on 2026-09-05: product brief, research implications, proposed use cases and requirements, evaluation guidance, framework brief seeds, and packet index. Product troubleshooting concerns the maker's own recorded batches; external-recipe cases remain discovery/evaluation. Detailed requirements remain draft; D14 now establishes the first milestone's product outcome. Original source documents are unchanged.

**Supersedes:** The unaccepted proposal to “add retrospective troubleshooting as a first-class entry.”

### D03 — Pasted-text import first, with explicit unknowns

**Status:** Accepted with channel sequencing  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Recipe import behavior and channel sequencing

**Decision:** Make pasted-text import and explicit unknowns a reliable initial path. Useful partial recipes may be saved, with affected calculations limited or unavailable rather than missing information invented. Deliver URL and file import in a later milestone. Conduct further discovery on photo import before committing it to delivery scope.

**Rationale:** Establish a reliable text-review workflow first, using the varied and incomplete recipe inputs identified in the research. Sequence additional input channels separately; photo import needs more discovery.

**Open questions:** Which later milestone includes URL and file import, which file formats are supported, and whether photo import warrants a product commitment. File import does not implicitly approve photo import. Detailed acceptance criteria remain subject to review; D14 establishes the first milestone's product outcome.

**Revisit trigger:** Text-import evaluation informs later channel planning; photo discovery establishes user needs, representative inputs, feasibility, and correction burden.

**Affected artifacts:** Product brief; IMP-01–IMP-03 and UC2; BRIEF-01; packet index and GSD milestone context.

**Alignment:** Register, product brief, requirements guidance, framework import brief, and packet index aligned on 2026-09-05. No later milestone number or file format selected; no other decision or detailed requirement marked accepted.

## Acceptance records — 2026-09-05

D04–D13 and D15 were accepted by Mark as written; D14 was accepted with the revised recipe-development outcome recorded below. Acceptance establishes product direction, not detailed acceptance-test approval or implementation completion.

### D04 — Batch and recipe history

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Batch and recipe history

**Decision:** Separate recipe, version, actual batch, observation, and proposed next attempt; preserve historical context.

**Rationale:** F06/F07; preserve what actually happened rather than reinterpret old batches through current data.

**Open questions:** Detailed design and implementation choices remain to be resolved within this decision's boundaries. D14 sets the first product milestone; detailed delivery planning belongs to GSD and Impeccable.

**Revisit trigger:** User research or evaluation evidence that challenges this decision's rationale or exposes a material tradeoff.

**Affected artifacts:** REC-01; BATCH-01/BATCH-02; LEARN-01.

**Alignment:** Acceptance recorded; packet approval summaries updated. Linked detailed requirements remain draft specifications, not an implementation plan or completed implementation.

### D05 — Recipe components

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Recipe components

**Decision:** Represent base, ripple, sauce, and inclusion boundaries.

**Rationale:** F03 and EV02/EV03; components can have distinct preparation, calculation scope, and outcomes.

**Open questions:** Detailed design and implementation choices remain to be resolved within this decision's boundaries. D14 sets the first product milestone; detailed delivery planning belongs to GSD and Impeccable.

**Revisit trigger:** User research or evaluation evidence that challenges this decision's rationale or exposes a material tradeoff.

**Affected artifacts:** REC-02; IMP-03; OBS-01.

**Alignment:** Acceptance recorded; packet approval summaries updated. Linked detailed requirements remain draft specifications, not an implementation plan or completed implementation.

### D06 — Balance and trust

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Balance and trust

**Decision:** Treat balance as an assessment under assumptions, not a gate or guarantee.

**Rationale:** F05/F07; calculated ranges do not establish that a batch will succeed.

**Open questions:** Detailed design and implementation choices remain to be resolved within this decision's boundaries. D14 sets the first product milestone; detailed delivery planning belongs to GSD and Impeccable.

**Revisit trigger:** User research or evaluation evidence that challenges this decision's rationale or exposes a material tradeoff.

**Affected artifacts:** FORM-01; DIAG-01.

**Alignment:** Acceptance recorded; packet approval summaries updated. Linked detailed requirements remain draft specifications, not an implementation plan or completed implementation.

### D07 — Diagnostic behavior

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Diagnostic behavior

**Decision:** Troubleshoot with evidence, alternatives, targeted questions, and manageable experiments.

**Rationale:** F05; incomplete evidence requires calibrated explanations and useful next checks.

**Open questions:** Detailed design and implementation choices remain to be resolved within this decision's boundaries. D14 sets the first product milestone; detailed delivery planning belongs to GSD and Impeccable.

**Revisit trigger:** User research or evaluation evidence that challenges this decision's rationale or exposes a material tradeoff.

**Affected artifacts:** DIAG-01/DIAG-02; FORM-02.

**Alignment:** Acceptance recorded; packet approval summaries updated. Linked detailed requirements remain draft specifications, not an implementation plan or completed implementation.

### D08 — Batch feedback

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Batch feedback

**Decision:** Make success and disappointment part of the same lightweight batch history.

**Rationale:** F06; useful learning includes successful attempts without requiring exhaustive logging.

**Open questions:** Detailed design and implementation choices remain to be resolved within this decision's boundaries. D14 sets the first product milestone; detailed delivery planning belongs to GSD and Impeccable.

**Revisit trigger:** User research or evaluation evidence that challenges this decision's rationale or exposes a material tradeoff.

**Affected artifacts:** OBS-01; BATCH-01/BATCH-02; LEARN-01.

**Alignment:** Acceptance recorded; packet approval summaries updated. Linked detailed requirements remain draft specifications, not an implementation plan or completed implementation.

### D09 — Ingredient information

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Ingredient information

**Decision:** Preserve ingredient provenance and bounded transformation estimates.

**Rationale:** F02/F05 and original F1–F3; estimated or unknown composition must remain distinguishable from supplied facts.

**Open questions:** Detailed design and implementation choices remain to be resolved within this decision's boundaries. D14 sets the first product milestone; detailed delivery planning belongs to GSD and Impeccable.

**Revisit trigger:** User research or evaluation evidence that challenges this decision's rationale or exposes a material tradeoff.

**Affected artifacts:** ING-01/ING-02; IMP-02.

**Alignment:** Acceptance recorded; packet approval summaries updated. Linked detailed requirements remain draft specifications, not an implementation plan or completed implementation.

### D10 — Recipe scaling

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Recipe scaling

**Decision:** Scale proportions while distinguishing mix mass, finished yield, and capacity.

**Rationale:** F02/F07 and original P1; proportional amounts do not establish volume, capacity fit, or identical process results.

**Open questions:** Detailed design and implementation choices remain to be resolved within this decision's boundaries. D14 sets the first product milestone; detailed delivery planning belongs to GSD and Impeccable.

**Revisit trigger:** User research or evaluation evidence that challenges this decision's rationale or exposes a material tradeoff.

**Affected artifacts:** SCALE-01.

**Alignment:** Acceptance recorded; packet approval summaries updated. Linked detailed requirements remain draft specifications, not an implementation plan or completed implementation.

### D11 — Product language

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Product language

**Decision:** Use familiar words by default without concealing advanced detail.

**Rationale:** F04/F08; recognizable outcome language and technical depth serve different needs.

**Open questions:** Detailed design and implementation choices remain to be resolved within this decision's boundaries. D14 sets the first product milestone; detailed delivery planning belongs to GSD and Impeccable.

**Revisit trigger:** User research or evaluation evidence that challenges this decision's rationale or exposes a material tradeoff.

**Affected artifacts:** Domain and language guide; UX copy; FORM-01; OBS-01.

**Alignment:** Acceptance recorded; packet approval summaries updated. Linked detailed requirements remain draft specifications, not an implementation plan or completed implementation.

### D12 — Unresolved interface choices

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Unresolved interface choices

**Decision:** Leave stars, Optimize, Scale, and Template labels open until relevant design testing.

**Rationale:** Conflicting source documents and the limits of word-frequency evidence do not justify final label choices.

**Open questions:** The listed labels and rating controls remain undecided; accepting this decision preserves those questions. D14 sets the first product milestone; detailed delivery planning belongs to GSD and Impeccable.

**Revisit trigger:** User research or evaluation evidence that challenges this decision's rationale or exposes a material tradeoff.

**Affected artifacts:** Domain and language guide; OBS-01; relevant design briefs.

**Alignment:** Acceptance recorded; packet approval summaries updated. Linked detailed requirements remain draft specifications, not an implementation plan or completed implementation.

### D13 — Brand and visual authority

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Brand and visual authority

**Decision:** Preserve existing branding as incumbent evidence; confirm its authority before expansion or replacement.

**Rationale:** Existing design work is evidence to review; research does not authorize a new identity.

**Open questions:** Which existing brand elements are binding remains to be confirmed before expansion or replacement. D14 sets the first product milestone; detailed delivery planning belongs to GSD and Impeccable.

**Revisit trigger:** User research or evaluation evidence that challenges this decision's rationale or exposes a material tradeoff.

**Affected artifacts:** Product brief; Impeccable handoff and design briefs.

**Alignment:** Acceptance recorded; packet approval summaries updated. Linked detailed requirements remain draft specifications, not an implementation plan or completed implementation.

### D15 — Discovery and evaluation

**Status:** Accepted as written  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Discovery and evaluation

**Decision:** Use a manual, reviewed import-and-advice pilot with follow-up when available.

**Rationale:** User proposal and EV01–EV05; evaluate usefulness with human review without assuming automated effectiveness.

**Open questions:** Case selection, live-pilot timing, and evaluation thresholds require planning; no automatic posting is authorized. D14 sets the first product milestone; detailed delivery planning belongs to GSD and Impeccable.

**Revisit trigger:** User research or evaluation evidence that challenges this decision's rationale or exposes a material tradeoff.

**Affected artifacts:** Evaluation scenarios and pilot protocol; TRUST-01.

**Alignment:** Acceptance recorded; packet approval summaries updated. Linked detailed requirements remain draft specifications, not an implementation plan or completed implementation.

### D14 — Develop the next olive oil recipe

**Status:** Accepted as revised  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** First product milestone and working-case context

**Decision:** Prioritize recipe development as the first product milestone. Use the in-progress olive oil recipe as the initial working case: review the recipe and first-batch notes, explore adjustments, preserve recipe versions, and prepare the next recipe for making through the review/print experience.

**Available assets:** Mark has an olive oil recipe printout in an alternate format and batch preparation notes from one completed batch. The olive oil recipe is not available as structured input. Other structured recipes can establish the existing recipe format. Mark also has calculation-module code, a review/print prototype, and possibly code implementing that prototype; the latter is unconfirmed. These assets are user-reported and have not been inspected for this decision.

**Rationale:** Ground the first milestone in Mark's actual recipe-development work and a concrete next-batch outcome, rather than letting import or discovery tooling determine the product priority.

**Success:** Mark can use Sprinkles to develop and prepare the next version of the olive oil recipe, retaining the previous recipe and batch context. Success does not require proof that the next batch tastes better.

**Boundaries:** The printout is working-case source material, not a commitment to photo or file import. Other structured recipes are format references, not an already-structured olive oil recipe. Automated diagnosis is not required to interpret notes or choose adjustments. D03's import-channel sequencing, D02's discovery boundary, and D16's open storage decision remain in force.

**Open questions:** Asset locations/content, detailed acceptance criteria, and design and technical choices will be addressed through Mark's GSD and Impeccable workflows. This handoff does not prescribe architecture, implementation steps, or code reuse.

**Revisit trigger:** Experience developing the olive oil recipe reveals a materially different product need or milestone outcome.

**Affected artifacts:** Product brief; requirements milestone context; evaluation working case; framework handoffs; packet index.

**Alignment:** Handoff documents aligned on 2026-09-05. No source assets inspected, framework initialized, implementation plan specified, or application code changed.

**Supersedes:** The unaccepted proposal to sequence delivery around trusted inputs/history before assisted diagnosis.

### D16 — Keep storage architecture open

**Status:** Accepted  
**Date:** 2026-09-05  
**Owner:** Mark  
**Scope:** Product architecture and framework handoffs

**Decision:** Sprinkles does not currently commit to local-only, local-first, or cloud-based storage, or to Google Drive synchronization.

**Rationale:** The storage approach requires consideration of the existing architecture research. Product documents must not preempt that evaluation.

**Open questions:** Storage architecture, synchronization approach, and provider selection.

**Revisit trigger:** Review the existing storage research alongside the requirements for access, synchronization, privacy, reliability, and operating cost.

**Affected artifacts:** Product brief; D14 in this register; architecture context supplied to GSD.

**Alignment:** Reconciled across the handoff packet on 2026-09-05: product brief, D14, packet index, requirements guidance, and framework handoff context leave storage/synchronization architecture open. Original source documents are unchanged and must not override this accepted decision.
