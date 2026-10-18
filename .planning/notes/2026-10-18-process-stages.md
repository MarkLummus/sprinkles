<!-- Mark's research, copied unchanged on 2026-10-18 from ~/Downloads/sprinkles-process-stages.md. -->
<!-- The companion path it cites (claude/sprinkles-sourced-formulation-bands.md) is .planning/notes/2026-10-18-sourced-formulation-bands.md. -->

# Process stages: fixed stage list, ingredient defaults, style templates

**Date:** 2026-10-18
**Status:** proposed
**Why now:** process steps (heat, cool, age, churn) currently live only in Mark's head and on the paper bench sheet. The formulation work turned up ingredient-specific timing rules (acid just before freezing, liquid oil after aging, allulose after heat). The database is still reset with each big change, so this is the cheap time to add it.

**Companion to:** `claude/sprinkles-sourced-formulation-bands.md`.

---

## 1. The model: three layers

| Layer | Holds | Example |
|---|---|---|
| **Ingredient** | `default_stage` from the fixed list, plus an optional `prep_note` and `requires_heat` flag | Citric acid → `before_churn`, prep note "add as 50% solution" |
| **Style** | A default process template: which stages are present, in order, with default settings | Ice cream: dry blend → combine → heat (69 °C, 40 min) → … → pack |
| **Recipe** | A copy of its style's template, editable; each ingredient row can override its stage | Olive oil recipe: adds `hydrate` at 85 °C; oil row at `before_churn` |

Ingredient list order stays as it is today. It sets the order **within** a stage. The stage sets where the boundaries fall.

---

## 2. Fixed stage list

In process order. The app defines this list; users can't add to it.

| # | Stage | What happens | Settings |
|---|---|---|---|
| 1 | `prep` | Mise en place: weigh, pre-blend, pre-disperse | — |
| 2 | `dry_blend` | Powders combined (gums dispersed in sugar) | — |
| 3 | `hydrate` | A portion heated separately to hydrate gums | portion (g), temp, time |
| 4 | `combine` | Liquids and dry blend brought together | — |
| 5 | `heat` | Pasteurize / cook | temp, time |
| 6 | `after_heat` | Added off the heat, before cooling | — |
| 7 | `cool` | Crash-cool | target temp |
| 8 | `age` | Held cold | hours |
| 9 | `before_churn` | Added to the cold, aged mix just before freezing | — |
| 10 | `during_churn` | Added in the freezer, late in the cycle | — |
| 11 | `pack` | Layered or swirled while filling containers | — |
| 12 | `harden` | Blast/freeze to storage temperature | temp, hours |

Serving temperature stays a recipe setting, as already decided; it isn't a stage.

---

## 3. Fallback rule when a stage is missing

If an ingredient's stage isn't in the recipe's template, the ingredient moves to the **next later stage that is present**. If there is none, it goes to the last stage. The app shows the move next to the ingredient ("moved from `after_heat`").

Moving later is the safe direction for the cases so far: heat-sensitive ingredients (allulose, liquid oil, acid, cultures) end up further from the heat, not closer to it.

**Exception, a guardrail:** an ingredient with `requires_heat = true` (raw egg yolk) can't fall back past a missing `heat` stage. If the recipe has no heat stage, that's flagged as a guardrail failure, not silently moved.

---

## 4. Default stages for common ingredients

These are seed defaults. A recipe can override any of them.

| Ingredient | Default stage | Reason | Source |
|---|---|---|---|
| Sucrose, dextrose, skim milk powder, salt | `dry_blend` | Disperse gums and powders before liquid | Goff (gums dispersed in sugar) |
| LBG, guar, carrageenan | `dry_blend` | Blended with sugar to prevent clumping | Session process; Goff |
| Milk, cream | `combine` | | |
| Egg yolk | `combine`, `requires_heat` | Must be cooked | Food safety *[assumed standard practice]* |
| Allulose | `after_heat` | Browns readily with milk proteins | Session reasoning; *[verify]* |
| Vanilla extract, other volatile flavors | `after_heat` | Volatiles lost in the heat step | *[assumed common practice]* |
| Yogurt (live cultures) | `cool` | Heat kills the cultures | *[assumed]* |
| Liquid oils (olive, seed, nut) | `before_churn` | Keep separate from milkfat; preserve volatiles | Session reasoning |
| Citric, malic, tartaric acid | `before_churn` | Can precipitate milk proteins | Goff p. 448 |
| Alcohol, liqueurs | `before_churn` | *[assumed common practice]* | |
| Inclusions (chips, nuts, cookie) | `during_churn` | Last 5–10 minutes of churning | Whynter product guidance |
| Variegates, swirls | `pack` | | Goff (variegates) |

Items marked *[assumed]* reflect common practice, not a source in this project.

---

## 5. Default templates by style

Stages in brackets are present but optional; the user can remove them.

| Style | Template |
|---|---|
| Ice cream, frozen custard, gelato | prep → dry_blend → [hydrate] → combine → heat → after_heat → cool → age → before_churn → during_churn → [pack] → harden |
| Frozen yogurt | Same as ice cream. Yogurt defaults to `cool`. |
| Sherbet | Same as ice cream. Acid defaults to `before_churn`. |
| Sorbet | prep → dry_blend → combine → [heat] → [after_heat] → cool → [age] → before_churn → during_churn → [pack] → harden |

Default settings: heat 69 °C / 40 min (sealed vessel), hydrate 85 °C / 2 min, cool to below 5 °C, age 12–24 h, harden −20 °C or colder for 4+ h. These come from this session's process, not a published standard; adjust per recipe.

---

## 6. Data and snapshot notes

- `default_stage`, `prep_note` and `requires_heat` are ingredient coefficients. Under the existing architecture they're embedded in the recipe and belong in the batch snapshot and the `coefficient_set_id` digest.
- The recipe's process template (stages present and their settings) should also be snapshotted onto each batch, so a batch record shows how it was actually made.
- Ingredient row stage override is a recipe field, snapshotted with the formula rows.

## 7. Bench sheet

Group the ingredient list under stage headings, in template order, with each stage's settings shown in the heading ("Heat — 69 °C, 40 min, sealed jar"; "Age — 12–24 h at 4 °C"). Within a stage, keep the recipe's step order. The sheet becomes the order of operations.

## 8. Open

- Whether the mise en place feature (prep checklists, UI) builds on `prep` and `prep_note` or stays separate. This proposal covers only the data.
- Whether the fixed list needs a "custom step" escape hatch later. Deliberately not in v1.
