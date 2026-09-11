# Sprinkles ⇄ Ice Cream Council — Response to Data Contract v1

The council's original v1 contract (schema, data dictionary, implementation guide, example payload) is filed alongside this response at `icecream-council-v1/`. Directional evidence for a future integration, not a scoped or planned feature — see `PRODUCT.md`'s Evidence and Explicitly Undecided sections.

Thank you for the v1 contract — the entity model, the source/derived separation, and the null-vs-zero discipline are all things we already hold to internally, and we're glad to see them stated as first-class rules rather than conventions we'd have to infer. This response is organized as: where we agree outright, where we push back and why, and a concrete counter-proposal for the points in tension.

## Where we agree outright

- **Entity shape.** `Recipe → RecipeVersion → Batch → Observation` maps directly onto our own `Recipe → Version → Batch → Tasting`. No objection to adopting your naming for the exchange format itself.
- **Source vs. derived.** Our domain layer already treats calculated figures (PAC, POD, fat, MSNF, sugar, solids) as reproducible from stored inputs, never as data a client edits or a server silently rewrites. `calculated.engine_version` and "clients may discard and regenerate" match how we already work.
- **`null` ≠ `0`.** This is not a preference for us, it's closer to a constitution: our product explicitly refuses to invent precision, and a blank stays visibly blank everywhere in the UI (a maker's un-entered measurement is never coerced to zero, and zero is never silently read as "not recorded"). We'll hold you to this as hard as you're holding us to it.
- **Provenance and confidence.** We already carry an analogous idea — an ingredient value is flagged `estimated` or `unreviewed` in our UI when the coefficient behind it isn't a hard measurement. Your `provenance.confidence` enum is compatible; we'd map `estimated`→`low`/`medium` and treat unflagged values as `high` on export.
- **Council output stays separate from source records.** Your own guide already says this ("do not let language-model output mutate source ingredient composition or measured batch observations without an explicit user/app action") — this is exactly our TRUST-01 position (no network call or model output changes what a maker recorded, without them explicitly accepting it). We want this promoted from a guideline to a hard requirement of the contract, not just implementation advice.

## Where we push back

**1. The ingredient model is composition-first; ours is coefficient-first, and we can't fill in the gap without inventing data.**

Your `Ingredient.composition.*` fields (water_pct, fat_pct, protein_pct, lactose_pct, sucrose_pct, glucose_pct, fructose_pct, allulose_pct, ash_pct, etc.) assume full nutritional decomposition per ingredient, and the implementation guide is explicit that v1 "requires numeric composition fields for deterministic engine behavior; use 0 only when known/assumed absent, not merely unavailable."

Our ingredient library stores PAC/POD/fat/MSNF-style coefficients directly, snapshotted onto each recipe version at authoring time — not raw composition. For a lot of our ingredients (home-pantry items, not USDA-characterized), we genuinely don't know the full elemental breakdown, and "use 0 only when known-absent" gives us no honest way to represent "we don't have this number." Forcing a 0 for an unmeasured constituent is exactly the invented-precision problem our product exists to avoid, and it would silently corrupt any composition-sum validation you run on our data.

**2. The sensory model is a fixed 9-metric, 1–10 scale with no slot for a recipe-specific dimension.**

We just spent real design effort converging on a different shape: four-ish core axes (hardness, scoopability, smoothness, sweetness, density/body) on a 5-point goldilocks scale (too little / right / too much, directional on purpose — we want the direction to eventually drive improvement suggestions), *plus* axes a recipe declares for itself (our olive oil recipe declares "oil character" and "bitterness," with its own anchor words). Your `Observation.sensory.*` is a closed set — there's no way to express "oil character" or any other recipe-specific dimension inside it. We also carry a separate structured defects checklist (coarse/icy, sandy/gritty, gummy/elastic, greasy film) that doesn't map one-to-one onto your intensity metrics (iciness/gumminess get us partway there; sandy/gritty and greasy film don't land anywhere).

We'd rather not force our sensory model into your fixed shape, and we'd rather not ask you to accommodate our exact axis names — we think the right answer is making the *shape* extensible (below) rather than reconciling vocabularies now.

**3. Several `Batch.process.*` fields describe a more lab-grade setup than a home kitchen.**

`aging_hours`, `aging_temp_c`, `hardening_temp_c`, `storage_temp_c`, `storage_hours_before_test`, `homogenization_method`, `machine_id` — reasonable fields, but beyond what we currently ask a home maker to record. We expect most of these to travel as `null` from our side, which your contract already permits. Flagging this not as an objection but as an expectation-setter: don't read a batch with eight null process fields as an incomplete integration.

**4. This needs to be explicit about being a boundary format, not a shared source of truth.**

Your own guide says this ("intentionally not a database schema"), and we want to hold both sides to it. Our commitment: we will not adopt this schema as our internal storage model. We'll build a translation layer at the boundary — export our records into this shape when a maker explicitly sends something to the council, and treat anything that comes back as a separate, clearly-labeled analysis object, never a silent overwrite of what the maker recorded.

## Counter-proposal

1. **Make composition fields genuinely optional, not zero-filled.** Add a parallel, explicitly-partial representation: either (a) allow `composition.*` fields to be `null` with a `composition_completeness` marker (`full` / `partial` / `coefficient_only`), or (b) accept an alternate `composition_basis: "coefficient"` where an ingredient carries our PAC/POD/fat/MSNF-style values directly instead of full elemental composition, with the engine treating it as a distinct, lower-resolution input class. Your own roadmap already lists "ingredient revisions and constituent-level provenance" as a v1.1 candidate — we'd ask for the "allow unknowns" half of that now, since it's what makes v1 usable with a real, incomplete ingredient library rather than a synthetic one.

2. **Make `Observation.sensory` an open, named-metric structure instead of a fixed enum**, something like:
   ```json
   "sensory": {
     "core": { "sweetness": 5, "hardness": 7, ... },
     "declared": [
       { "name": "oil_character", "value": 8, "scale": {"min": 1, "max": 10, "low_anchor": "can't find it", "high_anchor": "dominant"} }
     ],
     "flags": ["coarse_icy", "bitter"]
   }
   ```
   Your fixed nine stay as the `core` block (still the interoperable common ground every recipe can report against); `declared` is where a recipe's own axes travel with enough self-description that a reader unfamiliar with the recipe can still interpret the number; `flags` is an open string array for defect-style boolean observations, versioned loosely (unrecognized flags are ignored per your own extension rule, not rejected).

3. **Scale conversion happens at the boundary, not in either system's native storage.** We'll keep authoring in our own 1–5 half-step scale internally; on export we'll linearly rescale to your 1–10 (documented, reversible mapping) rather than asking either side to change its working scale. If you're open to it, we'd suggest the contract state a canonical rescaling function once, so every client does the same conversion.

4. **Promote "council output never overwrites source data without explicit user action" from guidance to a MUST in the contract text itself**, since for us this isn't optional guidance — it's a standing product requirement (TRUST-01: no external model call or network import without a stated policy, and never a silent one).

## Why we're engaging with this now

We're not planning to wire this up as a background sync. The near-term use we have in mind is an "ask an expert" feature — a maker hits a wall on a specific recipe (won't scoop right, tastes flat, whatever) and explicitly asks the council for input, sending the relevant recipe version, and optionally batch/tasting history, as context for one conversation. That's a deliberate, user-initiated, one-shot export, not a persistent two-way sync — which is also why we're comfortable proposing an asymmetric contract (rich enough for you to reason about a recipe, honest about what we don't know, and never a channel that writes back into a maker's record without them saying yes).

We'd like to keep the entity model and the source/derived and null-handling principles as-is, and iterate on ingredient composition, the sensory shape, and the "no silent overwrite" language above. Happy to talk through any of this synchronously if that's faster than another round of documents.

## Round 2 — response to your counter-counter-proposal

Agreed on the scale point without reservation: preserve our native 1–5 values, scale, directionality, and anchors as-authored; you own any normalization on your side. It's a better answer than the boundary rescale we proposed — less lossy, and it keeps the honesty-about-precision principle intact on both sides of the exchange (a rescaled 3.5-on-a-9-stop-scale becoming a clean 7-of-10 would itself be a small invented precision).

On the two new envelopes — agreed these belong in v1.1, and here's a first draft of the shapes, built around the actual interaction we have in mind (a maker explicitly asks a specific question, with specific context, and gets back something they review before anything changes):

### `CouncilRequest`

```json
{
  "schema_version": "1.1",
  "request_id": "req_01J...",
  "requested_at": "2026-09-12T10:00:00-04:00",
  "purpose": "troubleshooting",
  "question": "Why won't this scoop right straight out of the freezer?",
  "context": {
    "ingredients": [ /* referenced Ingredient records */ ],
    "recipe": { /* Recipe */ },
    "recipe_version": { /* RecipeVersion, including calculated */ },
    "batches": [ /* zero or more, maker-selected */ ],
    "observations": [ /* zero or more, maker-selected */ ]
  },
  "app_context": {
    "app_name": "Sprinkles",
    "app_version": "…",
    "engine_version": "1.0"
  }
}
```

`purpose` is a small enum (`recipe_design`, `troubleshooting`, `experimentation`) matching the three use cases we're designing around — not because the council needs to branch on it necessarily, but so a request self-describes its intent for logging/audit on both sides. `context` is always maker-selected and explicit, never "everything we have" by default — matching our own product principle that nothing is sent without the maker choosing to send it.

### `CouncilAnalysis`

```json
{
  "schema_version": "1.1",
  "analysis_id": "an_01J...",
  "request_id": "req_01J...",
  "generated_at": "2026-09-12T10:00:04-04:00",
  "council_model": { "name": "…", "version": "…" },
  "summary": "Free-text overview.",
  "findings": [
    {
      "finding_id": "f1",
      "topic": "freezing_point_depression",
      "observation": "Sucrose-heavy sweetening pushes PAC lower than the batch's measured hardness suggests it should tolerate.",
      "confidence": "medium",
      "basis": ["recipe_version.ingredients[sucrose]", "observations[obs_1].sensory.hardness"]
    }
  ],
  "proposed_changes": [
    {
      "target": "ingredient_mass",
      "ingredient_id": "sucrose",
      "current_value_g": 80,
      "suggested_value_g": 60,
      "rationale": "Lower sucrose, raise dextrose share, to soften without losing sweetness balance."
    }
  ]
}
```

Two things we'd want to hold firm on, both extensions of principles already in your own guide:

- **`findings` and `proposed_changes` are advisory, never imperative** — same rule our own structural advisories already follow (state the basis, never a verdict, never "this will fix it"). No field in `CouncilAnalysis` should read as an instruction the app executes automatically.
- **A `proposed_changes` entry is never applied directly.** If a maker accepts one, it becomes a new `RecipeVersion` on our side the normal way — through our existing version-with-a-reason mechanism, citing this `analysis_id` the same way a version today can cite the batch that motivated it. The council's output becomes part of the maker's own authored history, not a silent mutation of it.

Open question on our end, not yet resolved: whether `basis` should be a loosely-typed string path (as sketched above) or something more structured/addressable. We don't have a strong opinion yet and would take a recommendation from you on what's actually usable on the analysis side.

## Round 3 — response to your `CouncilAnalysis` shape

```
CouncilAnalysis
    ├── findings
    ├── disagreements
    ├── hypotheses
    ├── recommendations
    ├── proposed_recipe_changes
    └── proposed_experiments
```

This is better than our draft and we'd like to adopt it as-is, with one clarifying question and one thing worth naming explicitly because it lines up with where we're already headed internally.

**`disagreements` is the right instinct, and it's more aligned with our own principles than a synthesized-consensus response would have been.** We've built our whole advisory system around never manufacturing false certainty — an advisory states its basis and stops, it doesn't resolve ambiguity it doesn't have. A panel that surfaces where its own experts disagree, rather than averaging them into one confident answer, is the same discipline applied to a multi-expert system. No pushback; this is a feature, not a rough edge.

**`hypotheses` and `proposed_experiments` map onto something we already have named but haven't built.** Our own decision register separates five things: the recipe, a version, an actual batch, an observation, *and a proposed next attempt* — that fifth entity exists in our product principles but has no implementation yet (today, developing a next version and saving it are the same action; there's no in-between "proposed, not yet committed" state). `proposed_experiments` looks like a natural seed for exactly that: a council-proposed experiment would land as a *proposed next attempt* a maker can review, adjust, and choose to promote into a real `RecipeVersion` — or set aside without ever touching their recipe. We think this is worth telling you about not because it changes anything you need to do, but because it means your shape is pulling us toward finishing a piece of our own model we'd deferred, which is a good sign the shapes are compatible in spirit, not just syntax.

**One clarifying question:** what's the intended distinction between `recommendations` and `proposed_recipe_changes`? We'd guess `recommendations` is advisory prose ("consider more stabilizer") without a committed target/value, and `proposed_recipe_changes` is the fully specified version (ingredient, current value, suggested value, rationale) — i.e., a recommendation that's been made concrete enough to act on. If that's right, we'll render them differently: recommendations read like our existing advisories (prose, basis, no action attached), proposed changes render as a reviewable diff. Confirming before we build against an assumption.

**Reiterating from Round 2, now against the fuller shape:** nothing under `proposed_recipe_changes` or `proposed_experiments` executes on its own. Both only ever become real state on our side — a new `RecipeVersion` or a new proposed-next-attempt record — through the maker explicitly accepting one, citing the `analysis_id` the same way a version today cites the batch that motivated it.

## Round 4 — response to your confirmation and the semantic ladder

Confirmed table and the ladder (Finding → Hypothesis → Recommendation → Proposed recipe change → Proposed experiment) both accepted as final for v1.1, no changes requested. A few notes on how this lands concretely on our side, and one open question.

**An atomic `proposed_recipe_changes` change set is, mechanically, a pre-filled draft of our existing "next version" flow — not a new UI concept.** Our pen for developing a next version already lets a maker change several ingredients and steps at once and save them as one version with one reason. A change set just seeds that same pen with the council's suggested values instead of a blank form; the maker edits or accepts as normal, and saving still goes through our existing ceremony. This is good news for us: no new interaction to design, just a new *source* for a version's draft values.

**`derived_from` becomes visible provenance, not just internal bookkeeping.** When a maker saves a version from an accepted change set, the version's existing "Why" field and lineage citation (today: "from version X, after the batch of [date]") gets a third citable source alongside parent-version and batch: "from version X, per the council's analysis of [date], recommendation: [text]." Same mechanism, one more thing it can point at. We'd ask that `derived_from` apply symmetrically to `proposed_experiments` → `hypothesis_id`, for the same reason.

**Recommendations render as read-only advisories, matching what we already have**, per your table's own "user can accept directly? not really" — this is exactly our existing structural-advisory pattern (states its basis, proposes no action, never phrased as a verdict). No new component needed there either.

**One open question on `proposed_experiments`:** a hypothesis-testing experiment presumably needs more than a formula diff — it needs to specify what to *observe* to actually test the hypothesis (e.g., "record draw temperature carefully this time," "taste at day 1 and day 7, not just once"). Does your schema carry that guidance as part of `proposed_experiments`, or is it expected to live in the accompanying prose? This matters to us because it's the difference between "proposed next attempt" being just a formula suggestion versus something that also tells the maker what to measure or watch for — which is the more useful version of the entity we described in Round 3.

## Round 5 — response to your `proposed_experiments` answer

Accepted as final: `hypothesis` reference, a controlled change or comparison (which may involve no formula change at all), observations/measurements to collect, relevant test conditions, and expected evidence/interpretation, with success criteria stated directionally or categorically rather than numerically unless a number is actually earned.

That last point — "directional or categorical expectations are preferable when numeric thresholds would imply unsupported precision" — is close to a restatement of our own founding rule (never invent precision the data doesn't support, never dress up an assessment as a guarantee). Good sign this contract is converging on shared values, not just a shared shape.

**One structural implication worth naming, since it changes how we build the entity, not just how we read the schema:** "may involve no formula change" means an accepted experiment doesn't always produce a new `RecipeVersion`. Sometimes it's purely a protocol for the *next batch of the current version* — measure more carefully, taste at a different interval, hold a stricter test condition — with nothing about the formula changing at all. So the "proposed next attempt" entity we described in Round 3 needs two landing spots on our side, not one: a proposed new `RecipeVersion` (when there's a formula change to review) and a proposed batch-recording protocol attached to the *existing* version (when there isn't). Both still route through explicit maker acceptance before anything is recorded; neither auto-executes. Flagging this now so it doesn't get lost by the time we actually build it.

This closes out our open questions on v1.1. Ready to consider the contract settled on our end unless something above needs another pass from you.

## Round 6 — v1.1 governing principles, locked

Reviewed against everything above; this is accurate and complete, nothing missing or misstated. Accepted as the closing statement of this negotiation:

1. **Boundary, not database:** Sprinkles and the council retain their own internal models.
2. **Explicit invocation:** context is maker-selected for a particular council request.
3. **Unknown ≠ zero:** partial ingredient knowledge remains explicitly partial.
4. **Native sensory semantics preserved:** no artificial normalization at transport.
5. **Source ≠ derived:** calculations are reproducible, versioned outputs.
6. **Analysis ≠ source state:** nothing from the council silently modifies a recipe, batch, or observation.
7. **Adversarial uncertainty is preserved:** findings, hypotheses, and disagreements do not get collapsed into false consensus.
8. **Recommendations are advisory; change sets are concrete:** an atomic `proposed_recipe_change` is a reviewable candidate diff.
9. **Experiments are epistemic:** they specify the hypothesis, intervention/comparison, observations, test conditions, and interpretation — not merely a different formula.
10. **Maker remains the commit point:** only explicit acceptance creates application state.

Contract settled on our end as of 2026-09-12. Nothing here has been built yet — this is the interop policy the council/Sprinkles integration will be designed against whenever that work is scheduled.
