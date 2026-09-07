# Sprinkles — Persona & Jobs to Be Done

## Persona: The Serious Enthusiast

Single target persona. Home hobbyists were considered and deliberately dropped —
requirements diverge too far to serve both well.

**Who they are**
- Makes ice cream 1–2× per week
- 1–5 years in
- Owns a compressor machine (Musso, Breville, Cuisinart ICE-100)
- May have an immersion circulator for pasteurization

**What they know**
- Understands that fat, sugar, and solids drive texture
- Has encountered PAC/POD; may not fully grasp them
- Experimenting with stabilizers and emulsifiers
- Learns from blogs, YouTube, possibly a book (*Hello My Name Is Ice Cream*, *Underbelly*)

**What they do**
- Invents flavor combinations
- Adapts recipes to available ingredients
- Takes batch notes and iterates
- Shares with family and friends

**What frustrates them**
- Recipes don't explain *why*, so they're hard to adjust
- Scaling changes texture in ways they didn't expect
- Nutritional data for unusual ingredients is hard to find
- Trial and error is slow and wastes ingredients

**What success looks like**
- Consistently scoopable texture
- Hitting a flavor idea in one or two batches
- Understanding a failure rather than just repeating it
- A personal library of recipes they trust

---

## The Loop

Jobs organize into five stages. **New vs. repeat is a path through these stages, not
a category of job** — that distinction is what broke the earlier grid, where the same
job kept landing in two cells.

```
   START ──> FORMULATE ──> PRODUCE ──> EVALUATE ──> CONSOLIDATE
     ^                        ^                          │
     └────────────────────────┴──────────────────────────┘
```

- **New recipe** runs the full loop.
- **Repeat recipe** runs Start → Produce → Evaluate, skipping Formulate entirely —
  unless a substitution is needed, which re-enters Formulate at F2.
- **Consolidate feeds Start.** A proven recipe becomes tomorrow's starting point.

---

## START — how a recipe begins

**S1.** When I have a flavor idea I want to chase, I want to turn it into a workable
formulation, so I can taste the idea instead of just imagining it.

**S2.** When I find a recipe I want to try, I want to make it work with my ingredients
and my equipment, so I'm not blocked by what the author happened to have.

**S3.** When I'm starting something close to a recipe I've already proved, I want to
begin from that proven base, so I'm not re-deriving work I've already done.

## FORMULATE — getting the mix right

Feedback here is continuous, not a separate "will this work?" checkpoint. Prediction
is a property of this stage, not a stage of its own.

**F1.** When I want to use an ingredient I've never worked with, I want to know how it
will behave in the mix, so I can build with it instead of avoiding it.
*(Finding nutritional data is the obstacle, not the objective. Framing it as a lookup
task pre-commits the design to USDA-shaped solutions.)*

**F2.** When I swap one ingredient for another, I want to see what it does to the
balance, so I can compensate elsewhere instead of guessing.
*(Also the re-entry point for repeat recipes made with what's on hand.)*

**F3.** When I transform an ingredient before it goes in — caramelize, toast, reduce —
I want the numbers to reflect what it actually is now, so my balance isn't built on
the raw version.

**F4.** When I'm adjusting toward a result I want, I want to see the tradeoffs as I go,
so I can make the call myself rather than discovering it after freezing.

## PRODUCE — turning a formulation into a batch

**P1.** When I'm making a different volume than the recipe was written for, I want the
balance to hold, so scaling doesn't cost me texture.

**P2.** When I execute a batch, I want the process I actually followed captured, so a
good result is something I can repeat rather than something that happened to me.

## EVALUATE — what the batch taught me

**E1.** When a batch disappoints me, I want to know what to change, so the next one is
better rather than differently wrong.

**E2.** When a batch comes out the way I wanted, I want that recorded, so I can tell
later whether I'm holding steady or drifting.

## CONSOLIDATE — turning a result into an asset

**C1.** When a recipe has proved itself, I want it to become a foundation I build on,
so good work compounds instead of sitting in a list.
*(Not "save as template" — that's the feature. The job is not starting from zero again.)*

---

## The sharpest constraint this produced

Because Formulate gives continuous feedback, **every batch that reaches Produce has
already been told it's balanced.** So E1 is, by construction, about a recipe that
*passed validation and still failed.*

The user is not asking "what's wrong with my numbers." They're asking "your app said
green and my ice cream is icy."

This has teeth:
- A diagnostic that re-explains PAC and POD is useless at E1 — those were already in range.
- E1 has to account for what the model can't see: flavor intensity, ingredient
  variability, churn behavior, execution error, aging, freezer temperature.
- A green batch that fails costs more trust than a red batch that fails, because the
  app made a claim.

The Balance Card reads as a verdict. That's correct during Formulate and a liability
at Evaluate.

## What the loop says about the product

- A returning user on a repeat recipe should never see the Formulate surfaces. The
  path skips them; the UI should too.
- E1 and E2 are the same screen doing two different jobs. Neither is served by a
  5-star rating and a free-text box: stars capture *that* a batch disappointed, not
  *what* about it, and prose isn't queryable.
- F1, F2, and F3 are all the same underlying gap — the ingredient data model has to
  represent things that aren't in any database. That's one problem wearing three hats,
  and it's the documented pain point.

---

## Verify before sharing

- **Persona specifics are unvalidated.** Batch frequency (1–2×/week), years of
  experience (1–5), machine models, and book references were drafted by me and
  accepted as "feels about right" — they have not been checked against real users.
  Treat as a working hypothesis, not research. [speculation]
- **The claim that home hobbyists and serious enthusiasts have divergent enough
  requirements to justify dropping one** is an assumption made in conversation, not
  a tested finding. [speculation]
- **"A green batch that fails costs more trust than a red one"** is a plausible
  inference about user psychology, not something measured. [speculation]
- Job set is derived from this conversation only. No user interviews, surveys, or
  competitive analysis fed it.
