# Sprinkles

## What This Is

Sprinkles is a recipe app for home ice cream makers who want to create better recipes, repeat successful batches, and understand what to change when a result disappoints them. It connects what was planned (the recipe), what was actually done (the batch), and how the result was experienced (observations), so each attempt can inform the next. Mark is the first user and is inside the target persona.

Product truth lives in `product-requirements/` (read `README.md` first). This file is GSD's delivery record: it points at that packet and records delivery state, milestone scope, and implementation decisions. It is not a second product definition.

## Core Value

Make something you like, understand how it turned out, and know what to keep or change next time. If everything else fails, a maker must still be able to develop a recipe, make it from a printed sheet, and get back a record of what happened that the next version can cite.

## Requirements

### Validated

- ✓ Review the churned olive oil recipe (50 g oil, 800 g) inside Sprinkles: twelve rows, method, authored notes, six balance figures against their bands with the basis stated, estimated data flagged at row and figure — REC1-01, FORM1-01, FORM1-02 — Phase 1
- ✓ Review the first-batch notes inside Sprinkles alongside the churned recipe: the 2 Aug batch seeded as a record with its as-made column, struck and changed method steps, churn measurements, and tasting marks — BATCH-01, OBS-01 — Phase 2
- ✓ Record the first batch as an actual attempt against that recipe state: as-made deviations in a pen layer, a snapshot of the version's rows and coefficients taken once and proven not to move, blank kept distinct from zero, unknown written as a word, tastings and amendments as separate records, a way in and a way out of the pen layer — BATCH-01, BATCH-02, OBS-01 — Phase 2
- ✓ Develop the next version from the churned one: the pen opens on any version (grams, allocation, remove/restore per row and step, step text and targets, headnote, notes), every change shows the old value struck beside the new, the six figures and four derived advisories answer live with their basis stated, a save lands on the child's own URL naming its parent and the batch that motivated it, the churned version and its batch are untouched, and show-changes lays the comparison back on the page — REC1-02, REC1-03, REC1-04, REC1-05, FORM1-03, FORM2-01, FORM2-02 — Phase 3
- ✓ Explore adjustments with before/after balance figures, stated assumptions, and no promise of success — FORM-01, FORM-02 — Phase 3
- ✓ Preserve the churned version and the new version as distinct, with lineage; editing the new one never rewrites the old batch — REC-01, BATCH-02 — Phase 3

### Active

Milestone 1 — **Develop the next olive oil recipe** (accepted D14). Requirement IDs are the packet's (`product-requirements/04-requirements.md`); their detailed acceptance criteria remain draft until reviewed in phase discussion.

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

**Repo state.** Phase 1 shipped the `app/` workspace (React 19 + Vite 8 + JSX, react-router 8, idb 8, Vitest 5) with the recipe read surface, the framework-free balance module, and the provisional IndexedDB store behind a repository seam. Both CLAUDE.md files describe it. Phase 2 added the batch record: a `batches` object store (schema v2) behind the same seam, framework-free `domain/batch.js` and `domain/axes.js`, the pen layer on the recipe page (as-made column, per-step strike and changed line, churn section, tastings with marks, amendment), batch URLs, and store files at `schemaVersion` 2. Phase 3 added the plan's pen: the version record gained lineage fields, per-row/step removed flags, step `uses` lists and inherited-note markers via a one-time IndexedDB upgrade (database version 3, store files at `schemaVersion` 3 with older files lifted on import); framework-free `domain/lineage.js`, `diff.js`, `uses.js`, `stepNumbers.js` and `advisories.js`; the save ceremony in the headnote, the lineage line with a `?changes` show-changes toggle, the version strip, and the four derived advisories in the margin. Twelve plans, of which seven closed UAT gaps.

## Constraints

- **Product authority**: The decision register governs; Mark approves scope and design. Neither framework may resolve an open decision by running first.
- **Tech stack (ratified)**: React with JSX, bundled by Vite, tested with Vitest, as recorded in `CLAUDE.md` — ratified in Phase 1 on real code. TypeScript is not adopted. Domain math lives in framework-free modules.
- **Persistence (provisional)**: A local store behind a small repository seam, labeled provisional, so D16 stays open and the backend can be replaced without touching the domain.
- **Ingredient data**: The old-sprinkles transcription (twelve rows, per-field basis) is the seed dataset, chosen in Phase 1 planning (D-01). Versions embed a copy of their rows' coefficients; batches snapshot them regardless.
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
| Stack React + Vite + JSX, provisional through Phase 1 | All inspected code points this way; ratify on real code rather than on mockups | ✓ Good — ratified Phase 1; Vitest chosen as the test runner |
| Milestone 1 persistence: provisional local store behind a repository seam | Preserves versions without settling D16; backend swappable later | ✓ Good — idb over IndexedDB behind `createRepository`, grep-enforced (Phase 1) |
| Reuse the old-sprinkles transcribed olive oil data (not its code) | Verified transcription of the churned sheet; rebuilding it adds nothing | ✓ Good — all nine printed-sheet figures reproduced within tolerance (Phase 1) |
| Ingredient seed dataset decided during phase planning | Three candidates disagree on coefficients; the data model should be designed first | ✓ Good — old-sprinkles transcription chosen (dextrose PAC 190, salt PAC 580), Phase 1 |
| Codebase map deferred until real code exists | Mockups are design evidence, not implementation | — Pending (real code now exists; map when useful) |
| GSD owns delivery; Impeccable owns design; register owns product | Per packet handoff rules | — Pending |
| Brand: only the name "Sprinkles" is binding; the Cupping Form world and cone/scoop mockups are incumbent evidence for Impeccable to preserve, expand, or replace with Mark's approval | D13 confirmation, 2026-09-05 | — Pending |
| Operating context: desktop formulates, paper works the kitchen, phone transcribes | Binder evidence; confirmed 2026-09-05 | — Pending |
| Version-embedded ingredient rows are the identity model; a shared library is a source copied at authoring time, never a render-time authority | Coefficient drift silently corrupted historical batches; a stored version's figures must not move when the library changes (D04, D09) | ✓ Good — invariant proven by test, Phase 1 |
| No third-party origins: system font stacks, no fetched assets, no network API under `app/src` | TRUST-01/IMP-01 with the fewest moving parts; verified by grep gates and the Phase 1 security review | ✓ Good — Phase 1 |
| Colour never carries status; deviation, estimated data, and contributor marks are text, outline, and weight | The Formulation Cookbook direction contract; a reader who cannot perceive colour loses nothing | ✓ Good — confirmed in Phase 1 UAT |
| Accessibility standard left undecided in the product record; UX1-01 still tests AA text contrast for milestone 1 | Mark declined to fix the standard yet; requirement was approved separately | ⚠️ Revisit |
| A batch snapshots the version's rows and coefficients once, by `structuredClone` in `createBatch`, and never retakes it; amendment and tasting are separate functions that never touch the snapshot | Coefficient drift corrupted historical batches; a correction must not silently re-snapshot (D04, D09, BATCH-02) | ✓ Good — proven by identity tests, Phase 2 |
| Blank is the absence of a key and a written `0` is a value; a blank measured field reads the word `unknown` and is never filled from the plan | The binder audit's finding: silence must stay legible as silence, and a record that reported the plan as a measurement would be false | ✓ Good — Phase 2 |
| Tastings are recorded only against an already-saved batch, never in the churn-recording session | Keeps the churn record and the later tasting as distinct events with their own dates | ✓ Good — Phase 2 |
| Cancel discards an unsaved draft with no confirmation dialog; the native leave-warning fires only while a draft is dirty | The brief forbids an invented dialog (D-24); draft persistence is Phase 4 UX1-02 | ✓ Good — confirmed in Phase 2 UAT |
| Store export writes `schemaVersion` 2; a v1 file still imports as a store with no batches, and a v1 file carrying batches is refused as malformed | Old exports keep working; a file that lies about its version is not trusted | ✓ Good — Phase 2 |
| `Save batch` weight and placement remain open against Impeccable; no button token was invented in Phase 2 | Design decisions belong to Impeccable, not to a gap-closure plan | ⚠️ Revisit — design debt (UAT G-02-4 half, UI review) |
| One pen at a time: developing, recording, amending and writing a tasting are all pens; every other opener, the version strip, the batch list and the lineage links disable with the reason in words, and no dialog or router blocker is built (D-UAT-1, D-UAT-2) | D-10 grants two mechanisms for unsaved ink and a modal is not one; a route-keyed page is the backstop so a pen can never follow the maker to another version | ✓ Good — Phase 3 |
| A step's stored number `n` is immutable identity; display numbers are derived (live steps renumber 1, 2, 3; a removed step's number is empty in the pen and struck in show-changes) (D-UAT-4, D-UAT-5) | Renumbering the key would make every step below a removal read as rewritten and strand row references, handlers and batch step changes | ✓ Good — Phase 3 |
| Removing a step flags only rows no remaining step uses; a removed step says in words which of its rows another step still covers (D-UAT-3) | Keeps the brief's rule, the code and the test agreeing while making silence legible | ✓ Good — Phase 3 |
| Column widths are padding-inclusive tokens; Data and Remove get their own widths; the ingredient name is the single unsized column and may wrap below about 1140px (D-UAT-6) | The Remove column had no width rule since 03-02 and painted over the Data column; honest arithmetic in tokens.css plus a test that recomputes the budget | ✓ Good — confirmed in Phase 3 UAT at 1024–1440 |
| Show-changes is URL-addressable by a `?changes` query parameter, no new route (Phase 3 D-02) | Composes with the batch route and the back button; the print route ignores it | ✓ Good — Phase 3 |
| Four derived advisories ship, not five; batch mass against the machine's minimum fill is held for SCALE-01 (Phase 3 D-05) | The packet gives machine capacity to SCALE-01 and forbids asserting a safe fit | ✓ Good — Phase 3 |
| A row's `portions` (`[{step, grams}, …]`) are what the maker authors and the row total derives as their sum; an unsplit ingredient is a one-portion row, so one rule covers split and unsplit; `step`/`splitStep` retire and split-step prose loses its amounts | The amount lived in two places that could disagree; deriving the total from the authored portions leaves one place for the number, and a one-portion row removes the second case rather than special-casing it | ✓ Good — Phase 03.2, every figure on the churned version and its 2 Aug batch provably unmoved |
| The store resets to the new shape rather than migrating to it: `DB_VERSION` bumps, the upgrade drops and recreates both object stores, a returning profile reseeds clean, and `versionLift.js` is deleted | Mark confirmed no stored record worth keeping — his profile held the seed and throwaway tests only. What a reset drops is compatibility with records held outside source, worth nothing while none exist. The discipline is deferred, not abandoned; the next shape change is expected to lift | ✓ Good — Phase 03.2, proven against a real IndexedDB |
| A blank portion means opposite things in the two places it is read, and the two are deliberately not routed through a shared helper: in the As-made column a blank contributes nothing to the reading and is never filled from the plan (D-10); in the pen a blank field keeps that portion's own stored amount, matching what the save path writes (D-01) | A helper would carry one filtering rule for two different meanings, and its second caller would be doing something the helper's name could not honestly describe | ✓ Good — Phase 03.2 gap closure; both readings asserted in full so a joined-string regression cannot pass green |
| The sketch is the acceptance target for a sketch-driven phase, read as a structural contract (element, grid placement, states, text), not as prose paraphrased through UAT → plan → checker | Phase 03.3's first gap pass lost the sketch's layout at planning: the Later row and the pen row were paraphrased into the wrong slot and the checker never opened the sketch; the second pass built to `03.3-SKETCH-CONTRACT.md` and passed | ✓ Good — Phase 03.3; the contract lists 15 scenarios the sketch does not draw, for Impeccable |
| Opener and save nomenclature (where "edit this version" versus "fork this version" is expressed), one batch record with an embedded tasting, and the end states abandon / accept-as-final are open design questions | Raised by Mark 2026-09-10 walking his own workflow; the app's Save / Save as trio and the tasting list predate the question | ⚠️ Revisit — for Impeccable before Phase 4 |

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
*Last updated: 2026-09-10 after Phase 03.3*
