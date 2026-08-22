# Sprinkles — Product Definition Handoff

**Session date:** 11 Aug 2026
**Status:** Paused pending design review and file cleanup
**Blocks:** User stories (step 4 of 4 in the definition sequence)

---

## What this session produced

The session began as UI mockup work and turned into product definition. Both tracks
completed something.

**UI track (finished):**
- Recipes Library page — pagination, type/rating filters, sorting, grid/list toggle,
  bulk selection with export/delete
- Delete confirmation modal — single and bulk, bulk lists the affected recipes
- Home page — cut to recent 10 + "View all" link, card hover actions, tablet responsive
- Feedback prompt variants — single pending, completed, multiple pending
- Onboarding completion state — brand icon, redirect
- Template Library page — 16 system templates, user template edit/delete, favorites
- Save as Template — save dropdown (Save / Save as Template / Export to File)

Also corrected during the session: the base template matrix now distinguishes
custard (egg) from Philadelphia-style (no egg) for Ice Cream, after research on which
styles are traditionally which. Gelato, Sorbet, Sherbet, and Frozen Yogurt are no-egg;
Premium and Super Premium are custard.

**Definition track (3 of 4 steps done):**

The agreed sequence was: personas → JTBD → use cases → user stories.

1. **Persona** — done. Single target: the Serious Enthusiast. Home hobbyists were
   considered and deliberately dropped; requirements diverge too far to serve both.
2. **JTBD** — done. `sprinkles-jtbd.md`. 12 jobs across a five-stage loop.
3. **Use cases** — done. `sprinkles-use-cases.md`. 11 use cases, each mapped to job
   IDs, each carrying a gap assessment. Gaps were verified against mockup source.
4. **User stories** — **not started.** Blocked on cleanup (see below).

---

## Decisions made — with rationale, so they don't get re-litigated

### The loop replaces the new-vs-repeat grid

An earlier attempt organized jobs as a 2×2: new/repeat × recipe-level/ingredient-level.
It failed. Three of eleven jobs wouldn't sit in one cell — substitution, scaling, and
"save as a starting point" each landed in two.

Diagnosis: **new vs. repeat isn't a category jobs belong to, it's a path through them.**
And recipe-level vs. ingredient-level was the data model wearing a JTBD costume.

Final structure — five stages:

```
   START ──> FORMULATE ──> PRODUCE ──> EVALUATE ──> CONSOLIDATE
     ^                        ^                          │
     └────────────────────────┴──────────────────────────┘
```

- New recipe runs the full loop
- Repeat recipe runs Start → Produce → Evaluate, re-entering Formulate only for a
  substitution
- Consolidate feeds Start

A sixth stage (Predict) was proposed and collapsed into Formulate, because balance
feedback is continuous while adjusting, not a discrete checkpoint.

### Continuous feedback creates the hardest problem in the product

Because Formulate validates continuously, **every batch reaching Produce has already
been told it's balanced.** So a disappointing batch is by construction one that
*passed*. The user isn't asking "what's wrong with my numbers" — they're asking
"your app said green and my ice cream is icy."

Consequences:
- A diagnostic that re-explains PAC/POD is useless there; those were already in range
- The Balance Card reads as a verdict — correct during Formulate, a liability at Evaluate
- A green batch that fails costs more trust than a red one, because the app made a claim

### Cross-user aggregation: deferred, not rejected

Trigger to revisit: enough users logging batches consistently that signal separates
freezer effects from formulation effects — realistically hundreds.

Reasoning: aggregation requires central storage, identity, consent, privacy policy,
retention, and uptime obligations. Storage stays local-first + Drive sync, which
preserves the reusable OAuth/Drive layer and means the user keeps their data if
Sprinkles disappears.

### LLM access is a proxy, not a server

Keeping an API key off the client needs roughly 100 lines with rate limiting. No
database, no accounts, no backend. "We need a server for LLM features" conflates the
two; only cross-user learning actually requires a backend, and that's deferred.

### Batch feedback schema is time-sensitive

The only decision here with an expiry date. Batches logged under a thin schema can't be
reconstructed later — you can't retroactively ask what texture problem someone had
eleven months ago. Whatever you'd want to aggregate in two years must be captured
starting with batch one, even though nothing reads it yet.

Design constraints agreed:
- Captured on **all** batches, good and bad. Failure-only collection has no baseline,
  so any pattern found later is uninterpretable.
- Per-batch: what was off (texture / sweetness / flavor / hardness), direction,
  optional note
- Freezer temp: asked **once, at the moment a batch disappoints** — motivated and
  likely measured, versus guessed at onboarding — then stored to profile
- Per-user constants (equipment, machine, typical aging) live on the profile from
  onboarding, joined at analysis time, never re-asked
- Must survive a tired user at 11pm. Three taps, not a ten-field form.

---

## Verified findings

Gap claims in `sprinkles-use-cases.md` were checked against mockup source rather than
asserted from memory. Results:

| Claim | Result |
|---|---|
| UC1 — template picker is style-based, not flavor-based | Confirmed |
| UC3 — Duplicate and Use Template split across surfaces | Confirmed |
| UC4 — no sourced/estimated marking | **Wrong as first written** — corrected below |
| UC5 — no delta shown on substitution | **Refined** — pattern exists, isn't reused |
| UC8 — repeat path shows formulation UI | **Confirmed and worse** |
| UC10 — single rating, no series | Confirmed |

**UC8 is the largest gap in the product.** There is no way to start, mark, or log a
batch from the recipe page — no mode state, no batch affordance at all. The entire
Produce → Evaluate half of the loop lives on the home page, disconnected from the
recipe being cooked from. This also explains why the feedback card fires on elapsed
time: there's no batch event for it to fire on.

**UC4 is cheaper than first assessed.** The lookup modal *does* carry `source` and
`confidence` on results — that part is designed. Two narrower problems remain:
provenance is discarded at save (the ingredient record has no such fields, the table
has no such column), and confidence is per-ingredient rather than per-field, which is
the wrong granularity for the normal case where macros are sourced and PAC/POD are
estimated. This is a schema change, not a redesign — and it's the dependency UC9 rests
on, since without per-field provenance the diagnostic can never separate "the model was
wrong" from "the ingredient data was a guess."

**UC5 is a reuse decision.** `icecream-optimize-slideout.jsx` already shows
`current → optimized` per metric and per ingredient with signed changes. Good pattern,
scoped only to Optimize. Applying it to manual substitution closes UC5.

---

## Blocking action: design review and cleanup

The file set is an exploration record, not a design. Diffing files on disk against the
Files Reference table in `sprinkles-todos.md` found **eight files documented nowhere**,
plus two the table already marks "not using."

Archive candidates — 10 of 36 JSX files, 28%:

| File | Reason |
|---|---|
| `icecream-spoon-icon.jsx` | Rejected direction — cone was chosen |
| `icecream-spoon-v2.jsx` | Same |
| `icecream-icon-concepts.jsx` | Superseded by `icon-refined` + `icon-animated` |
| `icecream-arrow-icons.jsx` | Same |
| `icecream-design-comparison.jsx` | Pre-`hybrid-concept` comparison |
| `icecream-validation-errors.jsx` | Superseded by `validation-with-optimize` |
| `icecream-validation-inline.jsx` | Same |
| `icecream-validation-two-line.jsx` | Same — but see note |
| `icecream-mint-palette.jsx` | Table already says "not using" |
| `icecream-teal-palette.jsx` | Same |

Two notes on execution:
- `validation-two-line.jsx` is the origin of the two-line row pattern that survived
  into `validation-with-optimize`. If it carries annotation explaining *why* that
  pattern won, extract the reasoning before archiving.
- Archive the palettes rather than delete. They're the only record that mint and teal
  were evaluated and slate was chosen.

Also found: `ingredients-page-spec.md` omits the `density` field present in
`icecream-ingredients-library.jsx`. The spec has drifted.

**Process issue worth addressing, not just the symptom:** eight files accumulated
outside the reference table undetected, and the spec drifted from the mockup. Both will
recur unless something keeps them honest.

---

## Next step

User stories, written against the **corrected** gaps rather than the originals.
Expect UC8 to generate the most, since it's a missing surface rather than a refinement.

Recommended reading before writing: `icecream-hybrid-concept.jsx` (the recipe page).
UC8 lives entirely there and it's where "what's already designed" matters most.
Verify other claims per-story with targeted grep — that method caught the UC4 error at
a fraction of the cost of reading everything.

---

## Open questions

1. **Does the design attention cluster?** Three gaps found — UC8's missing batch loop,
   UC4's discarded provenance, UC6's unsupported ingredient transformations — aren't
   refinements to existing surfaces. They're surfaces that don't exist. Worth noticing
   during review whether the 26 remaining files concentrate on Formulate and leave the
   rest of the loop thin.

2. **What does the app say at UC9?** When a validated recipe fails, the app must
   explain a failure of its own prediction. With single-user data it can rule causes in
   but rarely out, so the honest output is a ranked set of likely causes rather than a
   diagnosis — and the copy has to carry that without sounding evasive. Unresolved.

3. **What does Save as Template capture?** C1's job is about a *base* compounding, but
   the current design copies the whole recipe including its flavor. The design doesn't
   ask which the user wants.

4. **UC2/4a — the trust conflict.** A published, presumably-tested recipe that Sprinkles
   flags as unbalanced is likely a new user's first encounter with the balance engine,
   and they have no basis to judge who's wrong. Unhandled.

5. **How do the reference table and specs stay current?** See process issue above.

---

## Verify before sharing

- **Persona specifics are unvalidated** — batch frequency, years of experience, machine
  models, book references were drafted in conversation and accepted as "feels about
  right." Working hypothesis, not research. [speculation]
- **Dropping home hobbyists** rests on an assumption that requirements diverge enough
  to justify it. Not tested. [speculation]
- **UC7's process-risk claim** (capacity, churn, overrun at scale) reasons from ice
  cream physics, not measurements of specific machines. [speculation]
- **UC9's "rule in but rarely out"** infers what's achievable without cross-user data;
  not a tested limit. [speculation]
- The archive list and the six verification results **are** verified against source —
  not speculation.
- The USDA data gap (no PAC, POD, or sugar composition) is documented in project
  knowledge — not speculation.
- No user validated any of the definition work.

---

## Artifacts

| File | Contents |
|---|---|
| `sprinkles-jtbd.md` | Persona, 12 jobs, five-stage loop, the E1 constraint |
| `sprinkles-use-cases.md` | 11 use cases, gaps, verification log, job coverage table |
| `sprinkles-todos.md` | Updated — batch feedback schema, LLM proxy, deferred aggregation |
| `claude_sprinkles-product-definition-handoff.md` | This document |
