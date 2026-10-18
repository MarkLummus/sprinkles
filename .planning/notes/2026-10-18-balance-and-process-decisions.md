# Balance and process decisions, 2026-10-18

Mark's answers on Mark's List, recorded for the phases and milestone that act on them. The Phase 9 part of the same day's answers is D-20 in `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-CONTEXT.md`. Research behind them: `2026-10-18-sourced-formulation-bands.md` and `2026-10-18-process-stages.md` in this folder.

## The approved style values stand (`decide-sourced-bands-override-styles`: none)

Every value in `2026-10-16-style-bands-draft.md` stays as approved. The Sorbet differences against the sourced bands (serve temperature -14 vs about -10, POD 24-32 vs 22-27, solids 26-36 vs 28-35) follow from Mark's colder serving default: a sorbet served at -14 needs more sugar for the same frozen share, and solids is reference only. The sources describe shop practice at -10, not a better answer for his use.

Separate rule for the Balance redesign: the 32% sugar ceiling for sherbet, sorbet and ices (Goff p. 449, bleeding) is a guardrail on sugar percent, not POD. POD 32 on sucrose alone is 32% sugar, but a lower-sweetness sugar (dextrose, allulose) needs more grams for the same POD, so POD 32 can exceed 32% sugar.

## Frozen share: the Guelph method, target set by calibration (`decide-frozen-share-method`: guelph-calibrate)

Adopt Guelph's freezing calculation: convert the sweeteners to sucrose equivalents per 100 g of water, look the freezing point up in a sucrose table, and add the milk-salts term (MSNF + whey solids) × 2.37 ÷ water. Then run Mark's six known-good recipes (`sprinkles-empirical-targets.md`, outside the repo) through it and set the frozen-share target from where they land. Do not fix 72% or f = 0.79 beforehand: the 72% came from the six recipes under the July model, Goff's about 72% at -16 C and Mullan's 65-70%, and only Goff's figure plausibly rests on Guelph; the linear 1.86 model overstates the frozen share, so 0.79 in it and about 72% under Guelph may be the same firmness.

## The goal-and-guardrails Balance lands in v2.1 (`decide-balance-tiers-milestone`: v2-1)

After creation ships. The three tiers: the goal (% frozen at the recipe's serving temperature), the guardrails (solids floor and ceiling, the sugar ceiling, lactose to water, the structural fat floor), and the reference bands (the current gauges, read as convention). Per-style metric roles (goal, guardrail, defining, minor, n/a; the "Which numbers matter for each style" table) are stored on the styles table. It arrives as a styles-table update under D-12 (no reset) with a sketch 010 and 011 redraw by Sid. Two of the table's six styles, frozen yogurt and sherbet, are not seeded styles (`todo-custom-ice-cream-type`); the table puts overrun with the batch record, so the redesign decides whether the per-style overrun band stays.

## The fixed-stage process model is decided at Phase 11 (`decide-process-stage-model`: discuss-at-phase-11)

The Phase 11 discussion decides the model in `2026-10-18-process-stages.md` (twelve fixed stages, a process template per style, a copy on each recipe with per-row stage overrides, the fallback rule, a batch snapshot, a bench sheet grouped by stage). It must reconcile with what exists: versions already store numbered method steps with a lead-in, targets and the rows each step uses (MAKE-07), the stored `process` field (pasteuriseC, holdMinutes) and `decide-p9-heat-the-base`, and sketch 010's bench sheet. The version-shape parts land after the 9 to 10 bump as optional keys, the cheapest lift. The per-ingredient coefficients it needs are already in the Phase 9 seed (D-20).

## The Phase 10 style and machine pickers are menus (`decide-p10-style-control`: menu)

One menu control each, 44 px tall, the chosen type shown on it, opening a list of the types however many there are, replacing the four-cell joined group (Mark: "the 4-cell joined group is not scalable. I have other types that I will add later."). Sid redraws boards P10_Style and P10_Machine on the canvas page Phase 10 creation editor.
