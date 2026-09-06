# Sprinkles — Product brief

Status: product brief aligned with accepted decisions D01–D16. Open details are identified below; detailed design and implementation plans require separate review.

## What is Sprinkles?

Sprinkles is a recipe app for home ice cream makers who want to create better recipes, repeat successful batches, and understand what to change when a result disappoints them. It brings recipe development, preparation notes, and batch results together so each attempt can inform the next.

Its central promise is simple: **make something you like, understand how it turned out, and know what to keep or change next time.**

## The problem

An ice cream recipe describes ingredients and instructions, but it rarely explains enough to make every adaptation straightforward. A maker might replace a sugar, add fruit, use a different machine, or change the batch size without knowing how that will affect the result.

When the ice cream turns out icy, too hard, gummy, or less flavorful than expected, the recipe alone may not explain why. Ingredients, preparation, churning, storage, and serving conditions can all matter. Even a successful batch can be difficult to reproduce if the maker cannot remember what they changed.

Sprinkles connects what was planned, what was actually done, and how the result was experienced. It helps the maker investigate a problem without assuming that every disappointing result requires a different recipe.

## Who it serves

Sprinkles is designed for serious home enthusiasts: people motivated to understand and improve their ice cream, whether they are developing flavors, adapting published recipes, or repeating a favorite.

They do not need to own a particular machine or know formulation terminology. A maker can begin with “it was too hard to scoop” and explore more technical information when it helps. Experienced makers can inspect ingredient composition and recipe calculations in greater depth.

## How it works

### Develop a recipe

Start with a flavor idea, an outside recipe, or a trusted base. Bring in ingredients and instructions, review missing or ambiguous information, and adapt the recipe to available ingredients and equipment. Examine the expected effects and tradeoffs of changes before making a batch.

### Make and repeat

Open a saved recipe, follow its method, and record relevant substitutions or process changes. Capture how the batch turned out without completing a lengthy questionnaire. Reuse successful recipes and components while keeping their history.

### Learn from a batch

Review a recorded batch alongside its recipe and describe what worked or disappointed. Explore plausible explanations, answer useful follow-up questions, and choose a next experiment. Compare later attempts to see what changed and whether the result moved closer to the maker's goal.

## Core capabilities

- **Recipe collection and import:** save recipes from outside sources, preserve attribution, and review extracted ingredients and methods. Incomplete recipes can be saved with their unknowns visible.
- **Recipe development:** look up ingredient information, explore substitutions, account for preparation changes where evidence permits, and adjust quantities for a different batch size.
- **Components:** keep the churned base, ripples, sauces, and mix-ins distinct so their quantities, preparation, and results can be understood separately.
- **Making support:** provide readable and printable ingredients and methods, with deeper formulation information available when needed.
- **Batch history:** distinguish a reusable recipe from each actual attempt. Preserve the recipe version, known process differences, and relevant equipment context for that batch.
- **Results and troubleshooting:** capture observations in the maker's own words, explain possible causes with appropriate uncertainty, and propose checks or changes with expected benefits and tradeoffs.
- **Learning and reuse:** compare attempts, retain next-time notes, and build a personal collection of recipes and components that work well.

## Product principles

**Begin with the result the maker wants.** Use familiar language such as recipe, base, batch, icy, scoopable, and “next time.” Technical measures support understanding rather than define the entry experience.

**Separate facts from explanations.** Recipe instructions are not proof of what happened during a batch. An observation is not proof of its cause, and a proposed change is not a change already made.

**Make uncertainty visible.** Preserve missing quantities, unclear instructions, and estimated ingredient information. Explain which conclusions they limit rather than inventing precise answers.

**Keep everyday use lightweight.** Making a familiar recipe or recording a good result should be simple. Ask for additional detail when it can materially improve the advice.

**Support judgment, not guarantees.** Recipe balance calculations assess selected properties under assumptions. They do not guarantee texture, flavor, or success. Recommendations should explain their reasoning and leave the maker in control.

## Scope and boundaries

Sprinkles focuses on personal recipe development and learning from batches. Its initial scope excludes a social feed, automatic community posting, shopping or marketplace features, commercial business operations, and direct hardware control.

It does not promise a perfect recipe, an exact diagnosis from incomplete information, or an accurate model of every ingredient transformation. Importing a method does not certify its food safety.

Storage and synchronization architecture remain open decisions. The product does not prescribe local-only, local-first, or cloud-based storage, or a particular synchronization provider. Platform, implementation technology, deployment, supported equipment families, and detailed security and data-sharing policies remain to be specified.

## First product milestone

Recipe import starts with pasted text. URL and file import are planned for a later milestone; supported file formats and milestone placement remain to be determined. Photo import requires further discovery before a delivery commitment.

The first milestone focuses on **developing the next version of an olive oil ice cream recipe**: review the recipe and notes from the first batch, explore adjustments, preserve recipe versions, and prepare the next recipe for making through the review/print experience.

The working materials are a recipe printout in an alternate format and batch preparation notes. Other structured recipes can establish the recipe format, but the olive oil recipe itself is not structured input. Supporting assets include calculation-module code, a review/print prototype, and possibly code implementing that prototype; implementation-code availability is unconfirmed.

Success means the maker can develop and prepare the next olive oil recipe while retaining the previous recipe and batch context. It does not require automated diagnosis or proof that the next batch tastes better. The printout is source material, not a commitment to photo or file import. Detailed design and implementation planning belong to the GSD and Impeccable workflows.

## Discovery and evaluation

Troubleshooting other makers' recipes can test import quality, recipe calculations, and the usefulness of advice. These exercises may use product capabilities or dedicated evaluation tools, with human review. They do not require a customer-facing troubleshooting intake or onboarding flow. A specialized product workflow would need evidence of recurring user demand.

## What success looks like

A maker can bring in a real recipe without extensive retyping, identify what needs clarification, and save corrections reliably. They can record an attempt with little effort, retrieve what they used and did, and repeat successful work.

When seeking help, they can understand the proposed explanation, recognize its uncertainty, and choose a feasible next step. Over successive batches, Sprinkles should help them make more deliberate changes and learn which results they prefer.

Evaluation should measure import errors and correction effort, ease of recording and retrieving batches, comprehension and usefulness of advice, and outcomes of subsequent attempts. Adoption, repeat use, and willingness to pay require direct testing; numerical success targets remain to be established.

## Voice and identity

Sprinkles should feel knowledgeable, welcoming, and precise. Its language should respect experimentation and individual taste, explain unfamiliar terms without condescension, and be candid when the evidence is insufficient.

Visual identity and interface styling remain subject to design approval. They should make a capable recipe tool approachable without obscuring information or adding effort to routine tasks.
