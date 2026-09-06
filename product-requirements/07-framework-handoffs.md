# GSD and Impeccable handoffs

Status: handoff guidance based on accepted decisions, with **unapproved design-brief seeds**. This document neither reports framework initialization status nor specifies an implementation plan.

## Shared adoption sequence

1. Read the product brief and accepted D01–D16 decisions. Confirm only unresolved details relevant to the task; do not reopen accepted direction without a reason.
2. Inspect current code/assets and identify implemented versus designed-only behavior. Do not reuse historical gap claims as a fresh audit.
3. Confirm exact GSD distribution/version and unresolved platform, stack, and deployment constraints. Use accepted D14's recipe-development outcome as the first milestone; develop its detailed plan through the frameworks. No installation is authorized by this packet.
4. Seed framework-native context from approved decisions and selected requirements; preserve IDs and source links.
5. Shape the next surface with Impeccable, resolve material questions, and obtain explicit brief approval.
6. Feed that brief into GSD phase planning; implement the approved behavior.
7. Verify acceptance tests and design/accessibility on the same delivered flow. Propose requirement changes explicitly rather than letting either framework silently expand scope.

GSD owns delivery coordination; Impeccable owns design decisions and design QA. They must not run competing implementation efforts on the same files. Mark owns product and visual approval.

Accepted D02 makes external-recipe troubleshooting a discovery/evaluation workflow, not a dedicated product entry point. Keep pilot tooling separate from the customer-facing roadmap unless a specific capability is approved. The proposed batch and diagnostic surfaces below concern the maker's own recipes and recorded batches. Accepted D16 leaves storage and synchronization architecture open; consult the existing storage research before proposing an architecture, and do not assume local-first storage or Google Drive sync.

## First milestone context — olive oil recipe development

Accepted D14 prioritizes developing the next olive oil recipe: review the recipe and first-batch notes, explore adjustments, preserve recipe versions, and prepare the next recipe through the review/print experience. This is the product outcome, not an implementation sequence.

| Asset | Reported state |
|---|---|
| Olive oil recipe | Printout in an alternate format; not structured input |
| First batch | Completed; batch preparation notes available |
| Recipe format references | Other structured recipes can establish the existing format |
| Calculations | Module code available |
| Review/print experience | Prototype available |
| Review/print implementation | Code may exist; not confirmed |

These assets are user-reported, not inspected by this handoff. Mark can supply them to the framework workflows. Do not assume the printout requires building photo/file import, or that a format reference supplies the olive oil recipe's content. Do not prescribe a data conversion, code reuse, architecture, or implementation order from this inventory.

The existing surface seeds below are supporting context, not a delivery order. Recipe development and review/print design should be shaped around the approved working-case outcome; import review is not automatically the first surface. Automated diagnosis is not required for Mark to interpret batch notes and select adjustments.

## GSD adapter

This assumes the `.planning/`-based framework documented in [GSD's architecture](https://github.com/gsd-build/get-shit-done/blob/main/docs/ARCHITECTURE.md), consulted during the packaging discussion. Other distributions can use different conventions. Confirm the actual installed version before writing native artifacts or selecting commands.

| Target | Content to derive after approval |
|---|---|
| `.planning/PROJECT.md` | Concise approved purpose, audience, inherited constraints, current project state, references to shared product context |
| `.planning/REQUIREMENTS.md` | Selected requirement IDs and acceptance criteria from 04, with milestone scope and exclusions |
| `.planning/ROADMAP.md` | Dependency-aware, usable delivery slices; do not copy all proposals into committed scope |
| `.planning/STATE.md` | Delivery progress, blockers, and approved implementation decisions; not an independent product definition |
| Phase context | Relevant decisions, requirement IDs, approved Impeccable brief, cases, unknowns, protected scope |
| Plans/verification | Concrete implementation and tests derived from acceptance criteria; real-fixture expectations only when reviewed |

The product requirements packet retains rationale. GSD becomes the delivery tracker after adoption; the original todos remain historical design inventory unless Mark explicitly assigns another role. Update shared decisions first when scope changes, then update affected framework records.

### Ready-to-use GSD kickoff prompt

> Read product-requirements/README.md and follow its status and reading-boundary rules. Use only the active primary documents by default; consult research references for a specific need and do not load archived context. D01–D16 are accepted. D14 sets the first milestone's outcome: develop and prepare the next olive oil recipe, using the recipe printout, first-batch prep notes, and review/print experience. Other structured recipes establish format references; the olive oil recipe is not already structured. Supporting code/prototypes are user-reported, and review/print implementation code is unconfirmed. Use these as context for planning with Mark, not a prescribed implementation. Confirm your GSD distribution/version and inspect supplied assets through your workflow. Preserve requirement IDs, approved product boundaries, and open technical choices. Do not create a competing product definition or treat every draft acceptance criterion as approved. Obtain the relevant scope/design approvals before execution.

## Impeccable adapter

Based on the locally installed Impeccable skill's product-context and shape guidance. Its separation of product truth, design authority, and surface briefs informs this packet. This packet does not itself complete init or shape approval.

- **PRODUCT.md:** seed durable audience, jobs, purpose, operating context, principles, confirmed constraints, terminology, evidence, and binding brand commitments from 01/03/05. Confirm material gaps with Mark before creating it. Keep open decisions marked; do not invent positioning or platform. Do not put palette/token choices here.
- **DESIGN.md:** derive through the relevant Impeccable workflow after inspecting incumbent visual assets and confirming whether the task preserves, expands, or replaces them. Existing slate/blue cone/scoop work is evidence, not automatically final authority. Do not create a new visual world just because this file is absent.
- **Surface briefs:** use the seeds below, referenced requirements, and relevant examples from [evaluation scenarios](research-reference/06-evaluation-scenarios.md) only when needed. Confirm interaction/direction before implementation. Store approved briefs using the installed skill's conventions; filenames are not prescribed here.

All four proposed app surfaces use **Operate** mode: task clarity and reliable interactions lead; brand expression lives in supporting details. This mode belongs in each surface brief, not the global product definition. No palette, typography, layout topology, or final button labels are approved by these seeds. EV/SYN references can be looked up individually in [evaluation scenarios](research-reference/06-evaluation-scenarios.md); they do not add the research folder to default context.

### BRIEF-01 — Import and review

- **Audience/job:** maker bringing an outside recipe; leave with a faithful, editable recipe and visible unknowns. Requirements IMP-01–IMP-03, REC-02, ING-01, UX-01.
- **Sequence hypothesis:** supply text → review extracted content and unresolved items → correct or intentionally leave partial → save. Make source comparison available without forcing constant side-by-side reading.
- **Content:** EV01's short partial recipe; EV02's long multi-component method; EV04's leading update; EV05's non-recipe. Test original units and long ingredient qualifiers.
- **States:** empty input, working, complete/partial extraction, conflicting amounts, non-recipe, unavailable source/service, recoverable save failure, saved partial/saved complete.
- **Proof of success:** maker can find unknowns and correct errors without losing source context or entered data. No fictitious completion or silent quantity invention.
- **Channel scope (accepted D03):** pasted text first. URL and file import belong in a later milestone; file formats and milestone placement remain open. Photo import requires further discovery and is not committed through file import.
- **Open:** component-editing interaction; display of conversions and inference. No current mockup replacement authorized.

### BRIEF-02 — Make or record a batch

- **Audience/job:** maker preparing their own recipe or adding notes afterward; record actual execution with little unnecessary work. Requirements REC-01, BATCH-01/BATCH-02, OBS-01, UX-01.
- **Sequence hypothesis:** open saved recipe → record the batch and relevant deviations → record/revisit result. Notes may be entered during or after making; no separate retrospective troubleshooting entry is required. Simple recipe/method view by default, advanced details accessible.
- **Content:** EV01's missing process; SYN02's changing equipment/defaults; SYN03's successful dense batch.
- **States:** first batch, existing history, missing date/context, substitutions, profile defaults changed, draft/interrupted entry, save failure, success without detailed notes.
- **Proof of success:** maker understands recipe versus actual batch; quick entry works without ten required sensory fields; historical context remains inspectable.
- **Open:** overall outcome/rating control, minimum fields, how deviations are entered, reminders (not authorized by this packet), device/environment assumptions.

### BRIEF-03 — Understand a result and choose a next experiment

- **Audience/job:** maker reviewing their own recorded batch; understand plausible explanations and choose a useful next step. Requirements DIAG-01/DIAG-02, OBS-01, FORM-01/FORM-02, TRUST-01, UX-01.
- **Sequence hypothesis:** describe result and goal → inspect relevant recipe/batch evidence → answer a targeted question if needed → compare explanation/check/change → accept or save a next attempt plan.
- **Content:** EV01's sparse evidence, EV02's serving context, EV03's successful base/failing inclusion, EV04 with recovery update withheld.
- **States:** insufficient evidence, competing explanations, useful process check instead of recipe change, unavailable AI service, rejected proposal, accepted plan, constraints cannot be met.
- **Proof of success:** maker can distinguish known facts, inference, and proposal; understands expected benefit/tradeoff and is not falsely promised a fix.
- **Open:** confidence presentation, how alternatives are ordered, and label for adjustment action. Pilot implementation is a separate evaluation choice, not this surface's scope. No unsupported scientific or safety claims.

### BRIEF-04 — Compare attempts

- **Audience/job:** maker improving or repeating a recipe; see what changed and decide what to repeat. Requirements LEARN-01, BATCH-02, REC-01, OBS-01, UX-01.
- **Sequence hypothesis:** choose attempts → inspect recipe/process/result differences → record interpretation → carry chosen change into next attempt.
- **Content:** EV04's two simultaneous recovery changes; SYN02/SYN03's history and successful variation.
- **States:** one batch only, missing old context, different recipe versions, multiple changes, different serving conditions, successful repeat, corrected historical record.
- **Proof of success:** comparison reveals known differences without implying causality; previous records remain intact.
- **Open:** comparison layout, baseline selection, recipe-version visibility, distinction between correction and new version.

### Ready-to-use Impeccable kickoff prompt

> Use the installed Impeccable skill. Read product-requirements/README.md, the product brief, decision register, domain/language guide, and the selected surface seed in 07-framework-handoffs.md. Follow the README's primary-only default reading set; consult research selectively and do not load archived context. Reuse settled facts and ask only material unresolved questions. Inspect existing Sprinkles mockups/assets before deciding their visual authority; do not treat missing PRODUCT.md or DESIGN.md as a blank slate. Confirm product context through the skill's init process when required, then shape the selected surface using the linked requirements and cases. Present a brief for approval; do not implement, rebrand, or treat provisional labels and decisions as settled. Any new capability must return to the product decision register before entering GSD scope.

## Per-feature handoff checklist

- Approved decision and requirement IDs, explicit exclusions, named target.
- Approved interaction brief and applicable visual authority.
- Known typical and difficult content; important empty/error/partial states.
- Reviewed tests, synthetic tests labeled, missing annotations acknowledged.
- Accessibility/device expectations and service/data-handling constraints.
- Open questions that must not be invented during build.
- Verification split: GSD checks behavior and delivery; Impeccable checks design, interaction, and accessibility through its bounded review process.

Do not preload the entire Reddit corpus into every agent. Supply concise relevant facts and case boundaries, then retrieve source material only when needed.
