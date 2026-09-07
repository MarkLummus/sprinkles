# Sprinkles Outcome Language Model

## Purpose

Give the product one consistent vocabulary for what a maker observed while keeping
observation separate from diagnosis.

The model has three layers:

1. **Observation:** what the maker experienced, in their language.
2. **Interpretation:** a normalized outcome dimension and direction.
3. **Explanation:** ranked possible causes supported by recipe, process, equipment,
   storage, and serving evidence.

Sprinkles must not treat an observation as proof of a cause.

## Core object language

| Object | Definition | UI language |
|---|---|---|
| Base recipe | A reusable starting recipe, often unflavored | Base recipe |
| Recipe | Reusable ingredients, components, and method | Recipe |
| Recipe version | The immutable recipe state used for a batch | Usually implicit; expose in history |
| Batch | One actual execution of one recipe version | Batch |
| Batch result | Structured and free-text observations about that batch | How did this batch turn out? |
| Next adjustment | A proposed change for a later batch | Next time… |

## Outcome dimensions

### 1. Ice-crystal texture

**User words:** smooth, icy, coarse, crystalline, noticeable ice crystals, micro-icy  
**Prompt:** “How smooth or icy was it?”  
**Possible evidence:** water and solids, freezing rate, base temperature, machine,
extraction temperature, hardening, temperature cycling.

Do not use **creamy** as the positive endpoint. Creamy is a broad success judgment that
can include smoothness, richness, density, body, and melt.

### 2. Hardness and scoopability

**User words:** too soft, slushy, soft-serve, scoopable, firm, too hard, rock hard  
**Prompt:** “How hard was it at serving temperature?”  
**Required context:** serving temperature or time out of freezer.  
**Possible evidence:** sugars and alcohol, ice fraction, serving temperature, storage.

### 3. Body and elasticity

**User words:** thin, weak body, creamy, thick, gloppy, gooey, chewy, stretchy, gummy,
slimy, mucus-y  
**Prompt:** “How did the body feel?”  
**Possible evidence:** stabilizers, proteins, solids, emulsification, hydration and heating.

This is not a simple positive-to-negative slider. “Thick” may be desirable while gummy
is not. Capture description and desirability separately.

### 4. Air and density

**User words:** airy, fluffy, light, whipped, dense, heavy, low overrun  
**Prompt:** “How airy or dense was it?”  
**Follow-up:** “Was that what you wanted?”  
**Possible evidence:** machine, dasher speed, batch size, viscosity, extraction point.

Dense is descriptive, not inherently positive or negative.

### 5. Fat perception

**User words:** rich, clean, greasy, oily, buttery, waxy, fatty, coats the mouth/tongue  
**Prompt:** “How did the richness and fat feel?”  
**Possible evidence:** fat level and source, emulsification, fat destabilization, serving
temperature, flavor interactions.

Do not put rich, dense, greasy, and waxy on one axis. Richness can be desirable;
greasiness and waxiness can be distinct defects.

### 6. Grain and particles

**User words:** smooth, grainy, gritty, sandy, chalky, powdery  
**Prompt:** “Did you notice any graininess or particles?”  
**Possible evidence:** lactose or sugar crystallization, chocolate or nut solids, protein
aggregation, undissolved powders, fat destabilization.

Keep this distinct from ice crystals.

### 7. Sweetness

**User words:** not sweet enough, balanced, too sweet, cloying  
**Prompt:** “How was the sweetness?”  
**Possible evidence:** POD and sweetener mix, serving temperature, acidity, bitterness,
salt, flavor intensity.

### 8. Melt behavior

**User words:** melts too fast, holds its shape, clean melt, watery, frothy, separates,
weeps, does not melt naturally  
**Prompt:** “How did it melt?”  
**Possible evidence:** ice fraction, air, emulsification, stabilizers, serving conditions.

Frozen hardness and melt behavior are separate observations.

### 9. Flavor

**User words:** too weak, subtle, muted, comes through, balanced, too strong, overpowering,
flat, boring, eggy, bitter, tart, clean, aftertaste  
**Prompt:** “How did the flavor come through?”  
**Possible evidence:** ingredient amount and treatment, infusion time, fat, temperature,
acidity, sweetness, aroma loss, interactions with inclusions.

### 10. Component texture

**User words:** crunchy, crispy, soggy, frozen hard, chewy, disappears into the base  
**Prompt:** attach the observation to the mix-in or swirl, not the base.  
**Possible evidence:** water migration, coating, particle size, component temperature,
addition timing, storage.

## Batch-result interaction

### Overall result

- As intended
- Close
- Needs another batch

Avoid star ratings. They record approval but do not describe what happened.

### Structured prompt

1. **How did this batch turn out?**
2. **What did you notice?** Show relevant outcome dimensions.
3. **Was it too much, too little, or simply different from what you wanted?**
4. **Next time…** Capture the maker's proposed adjustment.

Preserve the maker's original words alongside normalized fields.

## Diagnostic language

Order messages as:

> Observed outcome → likely explanation → proposed check or change → tradeoff

Examples:

> This may freeze harder than you want. The recipe has relatively little
> freezing-point depression for its water content. Replacing part of the table sugar
> with dextrose may improve scoopability without increasing sweetness as much.

> The recipe appears balanced, so I would check the freezing process before changing the
> ingredients. The temperature out of the machine would help separate a recipe issue from
> a machine or batch-size issue.

Use calibrated confidence:

- “The most likely cause is…”
- “This can happen when…”
- “A second possibility is…”
- “There is not enough information yet to distinguish…”

Do not make the app say “in my experience”; it has evidence, not personal kitchen
experience.

## Primary and advanced terminology

| Primary UI | Advanced detail |
|---|---|
| How hard it freezes | PAC / freezing-point depression |
| Sweetness | POD |
| Milk solids | MSNF |
| Air / airy or dense | Overrun |
| Temperature out of machine | Draw/extraction temperature |
| Rest or chill the base | Aging |
| Heat the base | Pasteurization treatment, when applicable |
| Change batch size | Scale factor |
| Adjust balance | Optimization method |

The primary language should not hide advanced values. Progressive disclosure lets serious
enthusiasts use the technical model without making it the entry vocabulary for everyone.

## Data requirements

Each structured observation needs:

- `dimension`
- maker's original `description`
- normalized `direction` where meaningful
- `severity`
- `desired` state or preference
- component reference when the observation concerns a mix-in or swirl
- serving/storage context when relevant

Each diagnostic hypothesis needs:

- cause category: recipe, ingredient, preparation, machine, hardening/storage, serving
- supporting evidence
- contradicting or missing evidence
- confidence
- proposed test or change
- expected benefit
- tradeoff

This structure allows Sprinkles to learn from batches without pretending a vocabulary
label is itself a diagnosis.
