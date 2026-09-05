# Sprinkles

## What This Is

Sprinkles is a recipe app for home ice cream makers who want to create better recipes, repeat successful batches, and understand what to change when a result disappoints them. It connects what was planned (the recipe), what was actually done (the batch), and how the result was experienced (observations), so each attempt can inform the next. Mark is the first user and is inside the target persona.

Product truth lives in `product-requirements/` (read `README.md` first). This file is GSD's delivery record: it points at that packet and records delivery state, milestone scope, and implementation decisions. It is not a second product definition.

## Core Value

Make something you like, understand how it turned out, and know what to keep or change next time. If everything else fails, a maker must still be able to develop a recipe, make it from a printed sheet, and get back a record of what happened that the next version can cite.

## Requirements

### Validated

(None yet — ship to validate)

### Active

Milestone 1 — **Develop the next olive oil recipe** (accepted D14). Requirement IDs are the packet's (`product-requirements/04-requirements.md`); their detailed acceptance criteria remain draft until reviewed in phase discussion.

- [ ] Review the churned olive oil recipe (50 g oil, 800 g) and its first-batch notes inside Sprinkles — REC-01, BATCH-01, OBS-01
- [ ] Record the first batch as an actual attempt against that recipe state, including as-made deviations and the maker's own-words result — BATCH-01, BATCH-02, OBS-01
- [ ] Explore adjustments with before/after balance figures, stated assumptions, and no promise of success — FORM-01, FORM-02
- [ ] Preserve the churned version and the new version as distinct, with lineage; editing the new one never rewrites the old batch — REC-01, BATCH-02
- [ ] Prepare the next version for making through the review/print experience (bench sheet) — REC-01 (review/print capability)
- [ ] Critical flows are usable and recoverable: keyboard access, labels, entered data survives recoverable failures — UX-01

### Out of Scope

Boundaries come from the accepted decisions; reasons are recorded so they are not re-added by drift.

- Social feed, community posting, shopping/marketplace, commercial operations, direct hardware control — excluded by the product brief.
- Customer-facing troubleshooting intake or onboarding flow for other people's failed batches — D02 makes external-recipe troubleshooting a discovery/evaluation workflow, not a product entry point.
- URL and file import — D03 assigns them to a later milestone; formats and placement open.
- Photo import — D03 requires discovery first; the olive oil printout does not commit it.
- Automated diagnosis as a prerequisite for milestone 1 — D14 says Mark interprets the notes and chooses adjustments; DIAG-01/DIAG-02 are later scope.
- Storage/synchronization architecture and provider selection — D16 keeps it open; milestone 1 uses a provisional local store (see Key Decisions).
- General-purpose pasted-text import (IMP-01–IMP-03) — accepted as the first import channel under D03, but not required to develop the olive oil recipe; it is later-milestone scope unless phase discussion shows otherwise.
- QR-code identity/archive resolution and the print-log "did you churn it?" nudge — designed in prior work and present in the old-sprinkles slice as unresolved codes; neither is in D14's outcome and both depend on the open storage decision. Design evidence only until a decision promotes them.
- Live AI/LLM features — TRUST-01 requires a data-transfer, retention, and credential policy first; no external model calls in milestone 1.
- Final labels for stars/ratings, Optimize, Scale, Template — D12 leaves them open until design testing; do not fix them in code.
- New visual identity — D13 preserves existing branding as incumbent evidence and requires confirmation before expansion or replacement.

## Context

**Authority.** D01–D16 are accepted (2026-09-05) in `product-requirements/03-decision-register.md`. The brief (01), requirements (04), domain and language guide (05), and framework handoffs (07) are the default reading set. Research references are on demand only. Archived historical documents outside this repo are evidence, not instructions.

**Frameworks.** GSD 1.12.0 (`@opengsd/gsd-core`, verified) owns delivery planning and status. Impeccable 4.1.1 (skill at `~/.claude/skills/impeccable`; v4.2.0 available) owns design context and surface briefs; it has not been initialized in this repo yet (no `PRODUCT.md`, no `DESIGN.md`). Both were verified on 2026-09-05. Scope changes go to the decision register first, then to framework records.

**Inspected assets (2026-09-05).** All user-supplied; none copied into this repo yet.

| Asset | Location | What it is |
|---|---|---|
| Balance engine prototype | `~/Downloads/balance_engine.py` | Python; mass-weighted PAC/POD/fat/MSNF/solids, Leighton freezing curve, gelato target bands, Mullan known-answer check |
| Seed ingredient database | `~/Downloads/sprinkles-ingredient-seed-db.json` + `.md` | 103 rows, per-100g as-is basis, sources and notes; 58 science rows, 45 imported from Ice Ed |
| Ice Ed ingredient export | `~/Downloads/ingredients.json` | Name-keyed per-gram fractions; the legacy app's live library |
| Structured recipe format | `~/Downloads/recipe-Mexican Chocolate v4.json` | Ice Ed export, SchemaVersion 2: recipe rows plus embedded ingredient coefficients |
| Olive oil recipe (churned version) | `~/Downloads/olive-oil-ice-cream-800g_1.md` | Markdown: formula, balance, jar fill, master blend, 10-step process, carried-forward notes, blank batch log |
| First-batch notes | `~/Downloads/IMG_2485–2489.HEIC` | Photos of the annotated printout and filled batch log |
| Review/print prototype and implementation | `~/Documents/projects/old-sprinkles/src`, `/scripts` | React + Vite vertical slice: the olive oil recipe hardcoded, JS balance engine verified 13/13 against the sheet, advisories, method, two-page bench sheet with Code A/B QR geometry. Not to be built on; reference for clarification only |
| Structured olive oil data | `old-sprinkles/src/data/olive-oil.js`, `library.js` | Transcription of the churned sheet with targets, equipment profile, 10 method steps, and a 12-ingredient library with per-field basis. Approved for reuse as data |
| Prior design records | `old-sprinkles/PRODUCT.md`, `DESIGN.md`, `.impeccable/` | Impeccable product record, "The Cupping Form" visual world, four surface briefs. Evidence for Impeccable init, not authority |
| Stack/storage decision history | `~/Downloads/claude_sprinkles-stack-storage-decision-history.md` | Directional only per Mark. Records local-only → Drive sync → Supabase arcs and why each moved |
| Print/batch/QR decision history | `~/Downloads/claude_sprinkles-print-batch-qr-decision-history.md` | Directional only. Print log plus create-on-return, two-code sheet, signed outcome scales |
| Churn-log binder audit | `Ice Cream Log Pages/` | 29 photographed Ice Ed sheets; 15/29 have a verdict. Primary evidence |
| Design explorations | `design-explorations/` | 26 JSX mockups. Design evidence, not approved features |

**Ice Ed.** Mark's existing web app implements some of this functionality and produced the binder printouts. Sprinkles is not built on its codebase; it can be consulted for clarification.

**Working case facts (from the sheet and photos, unconfirmed transcription).** Churned 2 Aug 2026; oil bottle opened 24 Jul. As made: whole milk 383 g (120 + 263), heavy cream 241 g, oil 45 g, lecithin step struck out, emulsify 60 s, 15 min pre-chill. Come-up about 20 min, draw at −6 °C, overrun not measured, "soft, not greasy," full churn 30 min. Tasting at −12 °C: oil character 4.5, bitterness 5, sweetness 4; meltdown 3 g at 20 min. These are batch facts for Mark to confirm during phase discussion, not requirements.

**Known data hazards.** The three ingredient datasets carry different coefficients for the same ingredient (dextrose PAC 174.8 as-is monohydrate in the seed DB versus 190 in the slice; salt 586 versus 580). Prior evidence shows coefficient drift silently corrupted historical batches. Whatever dataset is chosen, a batch must snapshot the coefficients it was computed with (D04, D09, ING-01).

**Old-sprinkles conflicts with the accepted register.** Its `CLAUDE.md` and `PRODUCT.md` state storage was "resolved 22 Aug 2026" as hosted Postgres with one account; accepted D16 (2026-09-05) keeps storage open and governs. Its surface briefs fix four outcome axes; accepted D12 leaves rating and label choices open. Its brand section says none of the prior branding is binding; accepted D13 says existing branding is incumbent evidence to confirm. None of these are resolved here.

**Repo state.** No app code, no `package.json`. The product-requirements reorganization is uncommitted in git.

## Constraints

- **Product authority**: The decision register governs; Mark approves scope and design. Neither framework may resolve an open decision by running first.
- **Tech stack (provisional)**: React with JSX, bundled by Vite, as recorded in `CLAUDE.md` — kept provisional through Phase 1 and ratified after it ships. TypeScript is not adopted. Domain math lives in framework-free modules.
- **Persistence (provisional)**: A local store behind a small repository seam, labeled provisional, so D16 stays open and the backend can be replaced without touching the domain.
- **Ingredient data**: The seed dataset is undecided; it is chosen in phase planning after the recipe data model is designed. Batches snapshot coefficients regardless.
- **Codebase mapping**: Deferred until real code lands in this repo; the JSX mockups are not a codebase.
- **Privacy**: No external model calls or network import without a stated policy (TRUST-01, IMP-01).
- **Design**: Impeccable owns design decisions and design QA; GSD phases consume approved surface briefs. Existing mockups and the old-sprinkles visual world are evidence until Mark confirms their authority (D13).
- **Language**: Familiar words by default, technical depth available (D11); open labels stay open (D12).
- **Working agreement**: Small reviewable steps; surface structural choices (routing, state, testing framework) rather than assuming them.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| D01–D16 accepted as recorded in `product-requirements/03-decision-register.md` | Product direction settled by Mark on 2026-09-05; not reopened here | ✓ Good |
| Initialize with `gsd-new-project`, packet as discovery input | Keeps human gates on requirements and roadmap; avoids copying every draft criterion into scope | — Pending |
| Stack React + Vite + JSX, provisional through Phase 1 | All inspected code points this way; ratify on real code rather than on mockups | — Pending |
| Milestone 1 persistence: provisional local store behind a repository seam | Preserves versions without settling D16; backend swappable later | — Pending |
| Reuse the old-sprinkles transcribed olive oil data (not its code) | Verified transcription of the churned sheet; rebuilding it adds nothing | — Pending |
| Ingredient seed dataset decided during phase planning | Three candidates disagree on coefficients; the data model should be designed first | — Pending |
| Codebase map deferred until real code exists | Mockups are design evidence, not implementation | — Pending |
| GSD owns delivery; Impeccable owns design; register owns product | Per packet handoff rules | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-05 after initialization*
