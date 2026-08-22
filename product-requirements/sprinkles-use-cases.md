# Sprinkles — Use Cases

Derived from `sprinkles-jtbd.md`. Each use case maps to job IDs, describes the flow,
and names the **gap** — where the flow doesn't fit what's currently designed.

The gap field is the point. Use cases written after the UI exists tend to rationalize
the UI. A use case with no gap wasn't worth writing.

---

## UC1 — Formulate a recipe from a flavor idea
**Jobs:** S1, F1–F4
**Trigger:** User has a flavor concept and wants to build a recipe around it.

1. Creates a new recipe, selects a base template
2. Adds the flavor-defining ingredients
3. Balance feedback updates continuously as amounts change
4. Adjusts toward targets, seeing tradeoffs as they go
5. Saves

**Branches**
- 2a. Ingredient not in library → UC4
- 2b. Ingredient will be transformed in prep → UC6
- 4a. Can't reach balance manually → Optimize

**Gap:** Template selection asks for a *style* (Gelato, Sorbet, Philly). The user's
entry point is a *flavor*. Nothing helps answer "is this idea better as a gelato or a
sorbet?" — which is the first real decision in this use case and the one the app
currently skips.

---

## UC2 — Adapt an external recipe
**Jobs:** S2, F1, F2
**Trigger:** User found a recipe elsewhere and wants to make it with their ingredients
and equipment.

1. Imports via URL
2. System parses ingredients and process
3. User reviews and corrects the parse
4. System computes balance, flags issues
5. Substitutes unavailable ingredients (→ UC5)
6. Saves

**Branches**
- 1a. Source is a book, photo, or handwritten card — no URL
- 2a. Parse partial or failed → manual correction
- 4a. The published recipe is out of balance

**Gap:** Two.
*4a is a trust conflict on first use* — the app flags a published, presumably-tested
recipe as unbalanced, and the user has no basis to judge whether the recipe is wrong
or Sprinkles is. This is likely a new user's first impression of the balance engine.
*1a has no path.* A large share of enthusiast recipes arrive as book pages and
screenshots. Import is URL-only.

---

## UC3 — Create a variation from a proven recipe
**Jobs:** S3, F2, F4
**Trigger:** User wants something adjacent to a recipe that already works.

1. Opens the proven recipe
2. Duplicates it
3. Swaps or adds flavor ingredients
4. Balance updates; compensates
5. Saves as a new recipe

**Branches**
- 1a. Recipe was consolidated into a template → starts from the template instead

**Gap:** Duplicating a recipe and starting from its template are two mechanics serving
one job, exposed in two different places (recipe menu vs. template library), with
nothing to indicate which the user should reach for.

---

## UC4 — Add an ingredient not in the library
**Jobs:** F1
**Trigger:** A recipe needs an ingredient Sprinkles doesn't have.

1. Adds ingredient by name
2. Invokes lookup
3. System returns candidate values with source
4. Reviews, accepts or edits
5. Saved to library, available in the recipe

**Branches**
- 3a. Partial data — macros found, PAC/POD/sugar breakdown missing
- 3b. Nothing found → manual entry
- 3c. Multiple plausible matches → disambiguation

**Gap:** **3a is the normal path, not an edge case.** USDA carries macros and does not
carry PAC, POD, or sugar molecular composition — the documented gap in this project.
The flow needs partial data as its default shape.

*Verified against `icecream-ingredients-library.jsx`:* the lookup modal **does** carry
`source` and `confidence` on its results — that part is designed. Two problems remain:

1. **Provenance is discarded at save.** The ingredient record has no `source` or
   `confidence` field, and the table has no column for either. What the lookup knew is
   thrown away the moment the user accepts it.
2. **Confidence is per-ingredient, not per-field** — the wrong granularity for the
   case that actually occurs, where macros are sourced from USDA and PAC/POD are
   estimated. One ingredient legitimately holds both high- and low-confidence values.

Without per-field provenance persisted onto the record, UC9 can never distinguish
"the model was wrong" from "the ingredient data was a guess." This is the dependency
that makes UC9 possible at all.

---

## UC5 — Substitute an ingredient
**Jobs:** F2
**Trigger:** Ingredient unavailable, or user wants a different property.

1. Swaps A for B
2. Balance recomputes
3. Adjusts other ingredients to compensate

**Branches**
- 1a. Happens during a repeat batch — the re-entry point from the repeat path
- 3a. Asks the app to compensate → Optimize

**Gap:** The *delta* isn't shown for manual edits. "PAC: 31" and "PAC: 26 → 31"
answer different questions, and only the second is this use case.

*Verified:* the pattern already exists and is well designed — `icecream-optimize-slideout.jsx`
shows `current → optimized` for every metric and every ingredient, with signed change
amounts. It's simply scoped to Optimize. So this is a reuse decision, not a design
problem: the same treatment applied to manual substitution would close UC5 outright.

---

## UC6 — Account for a transformed ingredient
**Jobs:** F3
**Trigger:** An ingredient is caramelized, toasted, reduced, or browned before use.

1. Specifies the ingredient
2. Indicates the transformation
3. System adjusts composition (water loss, sugar inversion, etc.)
4. Balance reflects the transformed values

**Branches**
- 3a. Effect unknown → user enters measured values

**Gap:** Unsupported entirely. Ingredients are static library entries. Two possible
shapes — a per-use modifier, or derived library entries ("Sugar, caramelized") — and
neither is designed. Note also that for many transformations the honest answer is
*measure the yield loss*, which implies a weight-in/weight-out input that doesn't exist
anywhere in the app.

---

## UC7 — Scale a recipe
**Jobs:** P1
**Trigger:** User needs a different volume than the recipe specifies.

1. Opens Scale
2. Enters target yield, or scales by a limiting ingredient
3. Amounts recompute
4. Reviews and applies

**Gap:** Formulation-wise there is none — balance ratios are scale-invariant, so
"the balance holds" is arithmetic, not a feature. **The actual failure mode in scaling
is process, not formulation:** a 4× batch may exceed machine capacity, churn longer,
whip to different overrun, and freeze at a different rate. The app scales the numbers
correctly and says nothing about the thing that will actually go wrong.

---

## UC8 — Make a batch of an established recipe
**Jobs:** S3, P2, E2 (E1 on failure)
**Trigger:** User is making something they've made before.

1. Opens the recipe
2. Views or prints the process
3. Makes the batch
4. Logs the result

**Branches**
- 2a. Substitution needed → UC5
- 4a. Result disappoints → UC9

**Gap:** Three, and this is the largest hole found in verification.

*No batch affordance exists on the recipe page.* Verified against
`icecream-hybrid-concept.jsx`: nothing starts a batch, marks one as made, or logs one.
The only occurrences of "batch" are inside process step text and a notes placeholder.
**The entire Produce → Evaluate loop lives on the home page, disconnected from the
recipe the user is actually cooking from.**

*No mode distinction.* No `isNew`, `repeat`, or `batchMode` state anywhere — the page
renders the full formulation UI identically whether the user is developing a recipe or
making one for the tenth time. The loop says the repeat path skips Formulate; the UI
doesn't.

*Steps 2–4 span hours to days offline.* The app is opened, closed, reopened. The only
thing bringing the user back is the home-page feedback card, which fires on elapsed
time rather than on a batch actually having happened.

---

## UC9 — Diagnose a batch that failed despite validating
**Jobs:** E1
**Trigger:** A recipe the app marked balanced produced a bad result.

1. User indicates the batch disappointed them
2. System asks what was off (texture / sweetness / flavor / hardness) and direction
3. System asks freezer temperature — once, stored to profile thereafter
4. System offers candidate explanations spanning model gap and execution variance
5. User adjusts the recipe, or records the condition

**Gap:** Step 4 doesn't exist and is the hardest thing in the product. The app has to
explain a failure of its own prediction, distinguishing between:
- ingredient data was estimated and wrong (→ UC4's confidence signal)
- execution varied (temp, timing, churn, aging)
- the target range doesn't fit this user's equipment
- the target range is simply wrong

With single-user data and no aggregation, the app can rule causes *in* but rarely
*out*. The honest output is a ranked set of likely causes, not a diagnosis — and the
copy has to carry that without sounding evasive.

---

## UC10 — Log a successful batch
**Jobs:** E2, P2
**Trigger:** Batch came out as intended.

1. Confirms it went well
2. Optionally records the technique actually used
3. Recipe accrues batch history

**Gap:** Needs the same structured fields as UC9. Failure-only collection has no
baseline, so any pattern found later is uninterpretable. Separately: recipes currently
carry a single rating, not a series — and drift detection, which is the entire point
of E2, requires the series.

---

## UC11 — Promote a proven recipe to a foundation
**Jobs:** C1
**Trigger:** A recipe has proved itself across multiple batches.

1. Invokes Save as Template
2. Names and describes it
3. Appears in the template library as a start point

**Branches**
- 1a. Prompted rather than user-initiated

**Gap:** Entirely manual and undiscoverable at the moment it matters. The trigger
condition — several good batches of the same recipe — is something the app will know
from UC10 and could surface. Also unresolved: C1's job is the *base* compounding, but
Save as Template copies the whole recipe including its flavor. Unclear which the user
wants, and the design doesn't ask.

---

## Coverage

| Job | Use cases |
|-----|-----------|
| S1 | UC1 |
| S2 | UC2 |
| S3 | UC3, UC8 |
| F1 | UC1, UC2, UC4 |
| F2 | UC2, UC3, UC5 |
| F3 | UC6 |
| F4 | UC1, UC3 |
| P1 | UC7 |
| P2 | UC8, UC10 |
| E1 | UC9 |
| E2 | UC10 |
| C1 | UC11 |

Every job is covered. UC6 and UC9 are each the sole carrier of their job and are also
the two largest gaps — worth noting that the least-designed parts of the product are
the parts nothing else backs up.

---

## Verification log

Gap claims were checked against the mockup source. Results:

| Claim | Result |
|-------|--------|
| UC1 — template picker is style-based, not flavor-based | Confirmed (`typeFilters` only) |
| UC3 — Duplicate and Use Template are split across surfaces | Confirmed (Duplicate: home + recipes library; Use Template: template library + selection modal + home) |
| UC4 — no sourced/estimated marking | **Wrong as first written.** Lookup results carry `source` + `confidence`; the saved record does not. Corrected above. |
| UC5 — delta not shown | **Refined.** Pattern exists in Optimize, not reused for manual edits. |
| UC8 — repeat path shows formulation UI | **Confirmed and worse.** No mode state *and* no batch affordance on the recipe page at all. |
| UC10 — single rating, no series | Confirmed (`rating` is a scalar; feedback captures rating + free text only; no batch history view) |

Incidental finding: `icecream-ingredients-library.jsx` includes a `density` field that
`ingredients-page-spec.md` doesn't document. The spec is out of date.

## Verify before sharing

- **UC7's process-risk claim** (capacity, churn time, overrun at scale) is reasoning
  from ice cream physics, not a measured finding about specific machines. [speculation]
- **UC9's "rule in but rarely out"** follows from having no cross-user data; it's an
  inference about what's achievable, not a tested limit. [speculation]
- **UC2's claim that book/photo sources are a large share of enthusiast recipes** is an
  assumption about the persona, not research. [speculation]
- The USDA data gap (no PAC, POD, or sugar composition) is documented in project
  knowledge — not speculation.
- No user validated any of this. Same caveat as the JTBD doc.
