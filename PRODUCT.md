# Product

<!-- impeccable:product-schema 1 -->

Product authority is `product-requirements/` (accepted decisions D01–D16 in `03-decision-register.md`; read `README.md` first). This record carries the durable product truth Impeccable needs for design work and marks what is deliberately undecided. It does not restate the register and must not drift from it. Delivery status lives in `.planning/` (GSD).

## Platform

web

## Stack

React with JSX, bundled by Vite, as recorded in `CLAUDE.md`. Provisional through GSD Phase 1 and ratified on real code afterwards; TypeScript is not adopted. Domain math (balance figures, freezing behaviour, advisories) lives in framework-free modules. Persistence in milestone 1 is a provisional local store behind a repository seam; the storage and synchronization architecture is an open decision (D16).

## Users

Serious home ice cream enthusiasts, defined by motivation rather than equipment or vocabulary (D01): people who develop flavours, adapt published recipes, or repeat favourites, and who want to understand why a batch turned out the way it did. They can begin with "it was too hard to scoop" and go deeper into composition when it helps. Persona attributes beyond motivation are unvalidated.

Mark is the first user and is inside the persona. His 29 churn-log sheets (Aug 2024–Apr 2026) are the primary evidence of how the loop is actually lived.

## Product Purpose

Sprinkles brings recipe development, preparation notes, and batch results together so each attempt can inform the next. Its promise: make something you like, understand how it turned out, and know what to keep or change next time.

Success for the first milestone (D14): Mark can develop and prepare the next version of his olive oil ice cream in Sprinkles while the churned version and its batch record stay intact. Success does not require proof that the next batch tastes better, and does not require automated diagnosis.

Longer-run success: a maker can bring in a real recipe without retyping, see what needs clarifying, record an attempt with little effort, retrieve what they used and did, and make more deliberate changes over successive batches. Numerical targets are not yet established.

## Positioning

Sprinkles connects what was planned (the recipe), what was actually done (the batch), and how the result was experienced (observations), and keeps those three layers distinct. A recipe app shows ingredients and steps; a calculator shows balance figures. Sprinkles keeps history honest: a batch refers to the exact recipe state and ingredient coefficients it was made with, editing today never rewrites yesterday, balance is an assessment under stated assumptions rather than a verdict, and unknowns stay visibly unknown instead of being invented.

## Operating Context

- **Desktop formulates.** Recipe development, comparison, and printing happen at a laptop or desktop.
- **Paper works the kitchen.** The printed bench sheet is the artifact at the machine; ink on it (as-made grams, struck steps, draw temperature, tasting marks) is the batch's first record. Days pass between printing and returning to the app.
- **Phone transcribes.** Results are typed in later, sometimes from a phone with the sheet or its photo in hand. The phone is not a formulation target in milestone 1.
- **The working case.** Olive oil ice cream, 50 g oil, 800 g, churned 2 Aug 2026 in two 16 oz jars in a circulator bath, Whynter machine, 1 g kitchen scale plus 0.01 g precision scale. Its printout, batch-log photos, and transcription exist (see Evidence).
- **Rituals from the binder.** Print, weigh with a mise-en-place tick per row, write over printed grams when reality differs, note process values sparsely, record a verdict about half the time, and carry a "to fix" list forward by hand.
- **Evaluation.** Troubleshooting other makers' recipes is a discovery and evaluation exercise with human review (D02, D15), not a product entry point.

## Capabilities and Constraints

**Milestone 1 capabilities** (GSD `.planning/REQUIREMENTS.md`, IDs derived from the packet): open the churned recipe with balance figures and their basis; record the first batch with as-made deviations, measured values, and an own-words result; create and edit version 2 with lineage and a change reason citing the batch; compare versions in grams, % of batch, and figures; structural advisories with their basis; print a bench sheet (formula with as-made column, method with typed targets, blank batch-log page, human-readable short code). Batch size stays 800 g; ingredient handling stays within the recipe's twelve rows.

**Later milestones (accepted direction, not yet scoped):** pasted-text import first, URL and file import later, photo import after discovery (D03); components (D05); ingredient library and provenance editing (D09); scaling (D10); diagnosis and experiment planning (D07); comparison across attempts.

**Constraints that bind design:**

- Separate recipe, version, actual batch, observation, and proposed next attempt; historical context is preserved (D04). A batch snapshots the coefficients it was computed with.
- Balance is an assessment under assumptions, never a gate or guarantee (D06). Out-of-range recipes still save and print.
- Familiar words by default, technical detail available (D11). Terminology authority is `product-requirements/05-domain-and-language.md`.
- Preserve missing, inferred, and estimated information visibly; do not invent precision (D03, D09).
- Derived advice is structural; it must not predict sensory outcomes.
- Printing is not a batch trigger; a batch is created on return.
- No external model calls or network import without a stated policy (TRUST-01).
- Outcome dimensions are four fixed core axes — hardness, scoopability, smoothness, sweetness — plus the axes each recipe declares for itself (Mark, 2026-09-06, in `.impeccable/surfaces/route-recipe-batch.md`).

**Explicitly undecided (do not settle in design work):**

- Labels for stars/ratings, Optimize, Scale, and Template; whether an overall rating control exists (D12).
- Storage and synchronization architecture (D16).
- Ingredient seed dataset (three candidates disagree on coefficients); chosen in GSD Phase 1 planning.
- Accessibility standard: WCAG 2.2 AA is proposed and not yet confirmed as the product standard. GSD requirement UX1-01 tests text contrast at AA for milestone 1.
- Supported equipment families beyond the working case.
- Whether/how a "proposed next attempt" entity gets built — named in the product's own separation of recipe/version/batch/observation/proposed-next-attempt but never implemented (today, developing and saving a next version are the same action). Surfaced concretely by the council data-contract exchange (`product-requirements/research-reference/sprinkles-council-data-contract-v1.1.md`): an accepted council experiment needs two landing spots — a proposed new version, or a proposed recording protocol on the *existing* version when no formula changes — neither of which exists yet.

## Brand Commitments

The name **Sprinkles** is binding. Nothing else is. The following exist as incumbent evidence that design work may preserve, expand, or replace, each with Mark's approval (D13):

- "The Cupping Form" visual world built in the earlier attempt at `~/Documents/projects/old-sprinkles/DESIGN.md` and `.impeccable/direction-contract.md`: printed black, recorded ink blue, colour identifies and form carries state, Archivo and Archivo Narrow, light only, print-native.
- The cone-and-scoop icon and slate-blue palette from `design-explorations/` (26 JSX mockups, with mint and teal palette variants evaluated and not chosen).

Voice (from the brief): knowledgeable, welcoming, precise; respects experimentation and taste; explains terms without condescension; candid when evidence is insufficient. Avoid "your recipe is correct," "this will fix it," and equating one sensory word with one metric.

## Evidence on Hand

- `product-requirements/` — brief, decision register, requirements, domain and language guide, framework handoffs; research references on demand.
- `Ice Cream Log Pages/` — 29 photographed churn sheets and their audit (15 of 29 batches have a recorded verdict; print dates mislead; six pages carry hand-overwritten grams).
- Working case: `~/Downloads/olive-oil-ice-cream-800g_1.md` (the churned version), `~/Downloads/IMG_2485–2489.HEIC` (annotated printout and filled batch log), transcription in `~/Documents/projects/old-sprinkles/src/data/olive-oil.js` (approved for reuse as data).
- Balance engine prototype `~/Downloads/balance_engine.py`; seed ingredient database `~/Downloads/sprinkles-ingredient-seed-db.json`; Ice Ed exports `~/Downloads/ingredients.json` and `recipe-Mexican Chocolate v4.json`.
- Prior review/print implementation in `~/Documents/projects/old-sprinkles/src` (React + Vite slice, verified 13/13 against the sheet). Reference only; not built on.
- Decision histories for stack/storage and print/batch/QR in `~/Downloads/` — directional, not binding.
- Ice Ed, Mark's existing web app, for clarification of legacy behaviour.
- `product-requirements/research-reference/sprinkles-council-data-contract-v1.1.md` — a settled interop policy (10 governing principles) negotiated with an external "ice cream council" for a future "ask an expert" feature (recipe design, troubleshooting, experimentation), with the council's original v1 contract filed alongside it in `icecream-council-v1/`. Directional, not binding: nothing here is scoped or built; adopting it is its own future product decision (TRUST-01 policy, D16-adjacent storage question).

Absent, and not to be fabricated: user interviews beyond Mark, testimonials, customers, pricing, benchmarks, deployment, and any validated numerical success target.

## Product Principles

1. **Begin with the result the maker wants.** Recipe, base, batch, icy, scoopable, "next time" lead; PAC and POD support understanding rather than define the entry.
2. **Separate facts from explanations.** Instructions are not proof of what happened; an observation is not its cause; a proposal is not a change made.
3. **Make uncertainty visible.** Missing quantities, unclear steps, and estimated coefficients stay visible and limit what the app claims.
4. **Keep everyday use lightweight.** Making a familiar recipe or recording a good result is quick; ask for more only when it would materially improve advice.
5. **Support judgment, not guarantees.** Balance and advice explain their reasoning and leave the maker in control.
