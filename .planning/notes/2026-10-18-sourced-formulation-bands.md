<!-- Mark's research, copied unchanged on 2026-10-18 from ~/Downloads/sprinkles-sourced-formulation-bands (1).md. -->
<!-- The companion paths it cites (claude/...) are .planning/notes/2026-10-18-process-stages.md and Mark's sprinkles-empirical-targets.md, which is outside the repo. -->

# Sourced formulation bands, by dessert type

**Date:** 2026-10-18
**Status:** provisional, calibrating
**Companion to:** `claude/sprinkles-empirical-targets.md`. That note holds the bands derived from Mark's own known-good recipes. This one holds the published, cited values next to them. Neither replaces the other.

**Convention used throughout:** composition values are % of the mix by weight. "Sugar" for the Goff rows means total sweetener solids, which includes corn syrup solids and bulking agents (Goff Table 1.7, footnote a).

---

## How these numbers are used: one goal, guardrails, reference

The bands in this document are a starting point, not the goal. A recipe is measured against three tiers, and they carry different weight.

| Tier | What | Role | If outside |
|---|---|---|---|
| **Goal** | ~72% of water frozen at the recipe's serving temperature | What the design is trying to reach. The serving temperature is set by the user as part of the recipe; the type supplies only a default. | The recipe isn't finished. The UX should help close the gap. |
| **Guardrails** | Lactose/water ratio, structural fat floor, total solids floor and ceiling, sugar ceiling for sherbet/sorbet (section 5) | Failures that hitting 72% can't detect: sandy, greasy or collapsing, icy or thin, bleeding | The recipe isn't finished, even at 72%. |
| **Reference** | Fat, MSNF, sugar, PAC, POD, stabilizer bands by type (sections 3 and 4) | Describe the style and conventional practice. Sugar and PAC are levers for reaching the goal; fat, MSNF and POD describe the style and taste the designer intends. | Information only. Leaving a reference band can be deliberate: the olive oil batch sat below the POD band by design. |

Why the tiers matter: 72% measures firmness and nothing else. A recipe can hit it exactly and still be sandy, greasy, cloying or icy. The guardrails catch the failures firmness can't see; the reference bands explain what's conventional without claiming it's required.

Reference bands assume each type's usual serving temperature (section 2). When the recipe's serving temperature differs, sugar and PAC will drift out of band as a correct consequence of hitting the goal at a different temperature. That is expected, not an error.

**For the UX** (to carry into the UI conversation):
- Show the goal first and most prominently: % frozen at the chosen serving temperature, against 72%.
- Show guardrails as a separate group. Only these, together with the goal, determine whether a recipe is "done."
- Show reference bands visually distinct from guardrails, labeled as conventional ranges with the serving temperature they assume. A marker outside a reference band should not read as an error.
- When the user moves the serving temperature away from the type default, say so next to the reference bands.

---

## Which numbers matter for each style

The same three tiers, applied per style. Within the reference tier, a metric is either **defining** (it's what makes the style that style, so show it first) or **minor** (shown, but secondary).

| Metric | Ice cream | Frozen custard | Gelato | Frozen yogurt | Sherbet | Sorbet |
|---|---|---|---|---|---|---|
| % frozen at serve | goal | goal | goal | goal | goal | goal |
| Lactose / water | guardrail | guardrail | guardrail | guardrail | minor | n/a |
| Structural fat floor | guardrail if non-structural fat present | guardrail | guardrail if non-structural fat present | minor | n/a | n/a |
| Total solids floor / ceiling | guardrail (36 / 42) | guardrail (36 / 42) | guardrail (32 floor) | minor (weak source) | n/a | n/a |
| Sugar ceiling 32% | n/a | n/a | n/a | n/a | guardrail | guardrail |
| Egg yolk with no heat stage | guardrail | guardrail | guardrail | guardrail | guardrail | guardrail |
| Fat | defining (sets tier) | defining | defining | defining | defining (legal 1–2) | n/a |
| MSNF | defining | minor | defining | defining (tang, body) | defining (legal) | n/a |
| Egg yolk % | n/a | defining (legal ≥1.4) | minor (up to 4) | n/a | n/a | n/a |
| Sugar % | minor | minor | defining | minor | defining | defining |
| POD | minor (no source) | minor | defining | minor | minor | defining |
| Stabilizer % | minor | minor | minor (often none) | defining | defining | defining |
| Titratable acidity | minor | minor | minor | defining | defining | defining |
| Overrun (process) | defining (by tier) | minor | defining (low, 20–40%) | minor | minor (30–35%) | minor |

**What the table shows.**
- Dairy styles lean on guardrails; sherbet and sorbet lean on the goal. In ice cream and gelato, fat and milk solids add solids without lowering the freezing point much, so the solids and fat checks catch what the goal can't. In sorbet, sugar is nearly all the solids, so the goal plus the sugar ceiling covers almost everything.
- Each style has one to three defining metrics. Show them first in that style's balance view; the rest can sit in a secondary group.
- Acidity is minor for the dairy styles because it just follows MSNF (section 6a); a mix well above MSNF × 0.017 is the thing worth noticing there.
- The egg yolk row comes from `claude/sprinkles-process-stages.md`: an ingredient flagged `requires_heat` in a recipe with no heat stage.

**For the app.** Encode this as data on each style in the seed JSON rather than in UI code, so changing a metric's role is a data change:

```json
"metric_roles": {
  "frozen_pct_at_serve": "goal",
  "lactose_water_ratio": "guardrail",
  "structural_fat_floor": { "role": "guardrail", "when": "non_structural_fat_present" },
  "total_solids": "guardrail",
  "fat_pct": "defining",
  "msnf_pct": "defining",
  "sugar_pct": "minor",
  "pod": "minor",
  "stabilizer_pct": "minor",
  "titratable_acidity_pct": "minor",
  "egg_yolk_pct": "n/a"
}
```

Roles: `goal` · `guardrail` · `defining` · `minor` · `n/a`. Overrun is a batch/process value, so it belongs with the batch record rather than in formulation metric roles. The example above is the ice cream row; *[the JSON shape is a suggestion, not checked against the existing seed schema]*.

---

## 1. Primary target: % of water frozen at serving temperature

Three independent sources point to the same number.

| Source | % water frozen at serving temp | Basis |
|---|---|---|
| Mark's six known-good recipes (`sprinkles-empirical-targets.md`) | 70–72 (Strawberry the outlier at 64) | Measured against recipes he likes, served at −14 to −17 °C |
| Goff, Guelph e-book, "structure from the ice crystals" | ~72 at −16 °C | Typical ice cream; a reference point, not a stated target |
| Mullan, dairyscience.info | 65–70 | Stated for ice cream and gelato. **No source cited for the figure.** |

**Target: 72%. Band: 68–76%.**

PAC stays visible as a derived number, but it is not a per-type target. Mullan gives the only published tie between PAC and temperature: gelato at about PAC 27 (lactose counted, milk salts not) for about −11 °C.

The freezing calculation follows Guelph's published method: convert sweeteners to sucrose equivalents per 100 g of water, look up the freezing point in a sucrose table, and add a separate term for milk salts, (MSNF + whey solids) × 2.37 ÷ water. That last term reverses the earlier "leave ash out" convention. Ash only had to stay out while PAC bands were the target. A physical freezing calculation should include it, and it comes from MSNF, so no ash field is needed.

**Not sourced:** a different frozen share for different styles. No published value exists for sorbet, sherbet or frozen yogurt. The idea that fat-free sorbet needs a lower frozen share to eat equally soft is inference, not data. For now every type uses the same band, and the scoopability field in the batch log is what will calibrate it.

---

## 2. Serving temperature defaults

Serving temperature is a per-type default with a per-batch override (decision register). Because the target is % frozen, the serving temperature determines what formula is needed, not whether the recipe is "correct."

| Type | Published | Source | Mark's practice |
|---|---|---|---|
| Ice cream (all tiers) | −13 to −16 °C dipping cabinet | Goff & Hartel 7th ed. p. 446 | −14 to −16 °C |
| Ice cream, typical | −15 to −18 °C, typically −16 °C | Goff, Guelph e-book (sweeteners; ice crystals) | |
| Gelato | −11 to −12 °C display case | Carpigiani Gelato University; Mullan (~−11 °C) | −15 to −17 °C |
| Gelato | "pliable and sticky," no number | Goff & Hartel p. 442 | |
| Sherbet | Same firmness as ice cream at the dipping cabinet (−13 to −16 °C) | Goff & Hartel p. 446 | |
| Sorbet, ices | About −10 °C; storage −30 °C or colder | Goff & Hartel p. 451 | |
| Frozen yogurt | No source found | | |
| Frozen custard, fresh | No source found. Served from the freezer; typical batch-freezer draw is about −5 °C | Goff & Hartel p. 15 (draw) | |
| Frozen custard, hardened | Treat as ice cream | Inference | |

**Conflict:** Mark serves gelato 4–5 °C colder than shop practice, likely because it's held in a home freezer. With % frozen as the target that's fine: the formula solves for 72% at whatever temperature is actually used.

---

## 3. Composition bands

Goff values are from *Ice Cream* 7th ed., Table 1.7 (p. 15), checked against the print copy, unless marked otherwise. "Mark" values come from `sprinkles-empirical-targets.md`.

### Ice cream

| Type | Fat | MSNF | Sugar | Stab. + emuls. | Total solids | Source |
|---|---|---|---|---|---|---|
| Economy | 10 | 10–11 | 15–17 | 0.4 | 35–36 | Goff T1.7 |
| Standard | 10–12 | 9–10 | 14–17 | 0.2–0.4 | 36–38 | Goff T1.7 |
| Premium | 12–14 | 8–10 | 13–16 | 0.2–0.4 | 38–40 | Goff T1.7 |
| Premium (Mark) | 12.5–14 | 8–10 | 13–15 (added) | | 39–41 | Empirical, n≈2 |
| Superpremium | 14–18 | 5–8 | 14–17 | 0–0.2 | 40–42 | Goff T1.7 |
| Superpremium (Mark) | ~14 | ~8 | ~15 (added) | | 38–39 | Empirical, n=1 |

Table 1.7 also has nonfat, low-fat, light and reduced-fat rows if those types are wanted.

US legal minimums (21 CFR 135.110), separate from formulation bands: at least 10% milkfat and 20% total milk solids. MSNF can drop one point for each point of fat above 10%, down to 6%.

### Gelato

No source separates fior di latte from crema, so this is one type.

| | Fat | MSNF | Sugar | Egg yolk solids | Stab. + emuls. | Total solids | Overrun |
|---|---|---|---|---|---|---|---|
| Goff, typical formula (p. 442) | 8.0 | 7.5 | 16.0 | up to 4.0 | **none recommended** | | 20–40% |
| Italian trade sources (ilgelatoartigianale.info; Pasticceria Internazionale; De Felice) | 6–10 | 8–11 | 16–22 | | | 32–42 | |
| Mark | 5.5–6 | 10–11 | 16–16.5 (added) | | | 36–39 | |

### Frozen yogurt

| | Fat | MSNF | Sugar | Stab. + emuls. | Total solids | Source |
|---|---|---|---|---|---|---|
| Regular | 3–6 | 9–13 | 15–17 | 0.5 | 30–36 | Goff T1.7 |
| Nonfat | <0.5 | 9–14 | 15–17 | 0.6 | 28–32 | Goff T1.7 |
| Text, typical | 2–4 | | | | | Goff p. 443 |

Worked examples on p. 443: 2.5 / 14.4 / 18.75 / 0.44 stabilizer, and 2 / 14 / 15 / 0.35 stabilizer at 31.35% solids.

### Sherbet

| | Fat | MSNF | Sugar | Stab. + emuls. | Total solids | Source |
|---|---|---|---|---|---|---|
| Table | 1–2 | 1–3 | 22–28 | 0.4–0.5 | 28–34 | Goff T1.7 |
| Text | | | 28–32, and under 32 to avoid bleeding | | | Goff pp. 446, 449 |
| Overrun | 30–35% | | | | | Goff p. 446 |

**Conflict within the book on sugar:** 22–28 in Table 1.7 versus 28–32 in the chapter text. Recommendation: band 22–32 with a hard ceiling at 32.

US legal: milkfat 1–2%, total milk solids 2–5% (21 CFR 135.140). Fruit sherbets need at least 0.35% titratable acidity. Goff p. 448: 0.36% at 25–30% sugar, plus 0.01% for each 1% of sugar above 30%.

### Sorbet

| | Fat | MSNF | Sugar | Stab. | Total solids | Source |
|---|---|---|---|---|---|---|
| Goff | 0 | 0 | 28–32 (count fruit sugars) | 0.4–0.5 | | Goff pp. 450–451 |
| Italian trade sources | 0 | 0 | 26–32 | | 28–35 | ilgelatoartigianale.info; gelatoperpassione.it (blog) |

Coconut sorbets are the usual exception on fat (Dairy Foods, 2023).

### Frozen custard

| | Requirement | Source |
|---|---|---|
| Egg yolk solids | At least 1.4% | 21 CFR 135.110 |
| Composition otherwise | As ice cream | 21 CFR 135.110 |

No formulation bands found beyond the legal definition. Fresh and hardened profiles differ only in serving temperature (section 2).

---

## 4. Sweetness (POD)

| Type | Band | Source |
|---|---|---|
| Gelato | 14–21 | ilgelatoartigianale.info |
| Gelato | 15–19 | gelatoperpassione.it (blog, weak) |
| Sorbet | 22–27 | ilgelatoartigianale.info |
| Premium (Mark) | ~13 | Empirical |
| Gelato (Mark) | ~15 | Empirical |
| Ice cream, sherbet, frozen yogurt | No source found | |

Goff and the Guelph material have no numeric sweetness scale. Show POD unbanded where no source exists. Cold suppresses perceived sweetness and no published correction exists, so none is applied.

---

## 5. Guardrails (separate from reference bands)

Reference bands describe convention, and recipes may sit outside them. Guardrails are physical limits that the 72% goal can't detect, and they display as a different category.

| Limit | Value | Source |
|---|---|---|
| Structural fat floor when non-structural fat is present | ~8% of mix | **Rule of thumb, unsourced.** Whether it should scale with total fat is open. |
| Definition of structural fat | At least 70% solid fat at 4 °C | Goff & Hartel p. 451, stated for non-dairy fat blends |
| Lactose / water ratio | Under ~0.10 | Mark's recipes all sit below it (`sprinkles-empirical-targets.md`); commonly cited sandiness threshold 9–10%, not sourced here |
| Total solids ceiling, ice cream | 42% | Top of Goff Table 1.7; Tobias (above 42% heavy, soggy) |
| Total solids floor, ice cream and frozen custard | 36% | See below |
| Total solids floor, gelato | 32% | Italian legal minimum for dairy ice cream (Goff p. 22) |
| Total solids floor, frozen yogurt | 30% regular, 28% nonfat | **Weak:** low end of Goff Table 1.7 only, no stated minimum |
| Total solids floor, sherbet / sorbet | None | See below |
| Sugar ceiling, sherbet / sorbet / ices | 32% | Goff p. 449 (bleeding) |

**Why low solids is a guardrail.** Goff names low total solids as a cause of three texture defects: coarse/icy, crumbly, and weak (melts quickly to a watery texture). Sources: Table 14.4 (p. 427) and p. 39. In ice cream, fat and MSNF add solids without lowering the freezing point much, so a mix can hit the 72% goal and still be short on solids. The 72% goal can't detect this.

**Ice cream floor of 36%.** Supported from several directions:
- The only stated texture minimum found: total solids "should not be below 37%" (Tobias, Virginia Cooperative Extension HFST-540-1, undated). Use 37% as a softer warning above the 36% floor if wanted.
- Legal minimums: Canada 36% (Goff p. 22), India 36%, Norway 35% (Goff p. 22). Goff Table 2.3 (p. 21) gives economy ice cream as the legal minimum, "usually 35–36%."
- US law sets 1.6 lb solids per gallon, which works out to 35.6% only at the 4.5 lb/gal minimum weight. It's a per-volume rule, not a texture floor.
- Light ice cream: Canada sets 33%. Goff p. 437 says reduced-fat products keep total solids up by replacing fat with other solids; Table 15.1 holds them at about 35–37%.

**Gelato floor of 32%.** Italy's legal minimum for dairy ice cream is 32% (Goff p. 22). Goff's typical gelato formula (p. 442) sums to about 31.5–35.5%. Switzerland's minimum is 30%.

**No floor for sherbet and sorbet.** In these, sugar is nearly all of the solids and also sets the freezing point, so a recipe that hits 72% frozen already has enough. Goff recommends 28–32% sugar to avoid a hard, crumbly or coarse product (pp. 446, 448, 450–451). That is reference guidance; the goal enforces it. Note it conflicts with Table 1.7's 22–28% sweeteners for sherbet.

**Soft serve and fresh custard note.** For soft-serve mixes, Goff says fat below about 4% risks coarse or icy texture and weak body, and fat above about 12% risks churning and a greasy coating (p. 250). Relevant if fresh frozen custard is served from the freezer.

---

## 6. Ingredient fields agreed this session

Ingredient coefficients are embedded in each recipe and snapshotted onto batches (decision register), so these are recipe-level coefficients. They must be included in the batch snapshot and in the `coefficient_set_id` digest, or the QR drift check won't see a change.

| Field | Type | Rule |
|---|---|---|
| `fat_structural` | boolean | True if the fat is at least 70% solid at 4 °C (Goff p. 451). Milkfat, cocoa butter, coconut fat: true. Olive, seed and nut oils: false. Egg yolk fat: false (lipoprotein-bound). Store so it can become a solid-fat percentage later without a migration. |
| `emulsifier` | boolean | True for ingredients that bring their own emulsifier (egg yolk, lecithin). |
| `processing` | none / HTST / UHT / unknown | Mainly dairy. Affects flavor, not balance math. |

Egg yolk gets no band of its own. Show "yolk % of mix" as a displayed value. Goff's gelato formula allows up to 4% yolk solids; the US frozen custard minimum is 1.4%.

---

## 6a. Acidity

Added 2026-10-18, while the database is still reset with each big change, so no migration is needed. Acidity defines frozen yogurt, sherbet and sorbet, and it is the one style-defining property the model didn't track.

### Unit

**Titratable acidity (TA), % of mix, expressed as lactic acid.** That's the convention in Goff & Hartel and in the US sherbet standard. Every ingredient's acid is converted to lactic-acid equivalent once, at seed time, so the mix TA is a plain weighted sum.

Conversion by equivalent weight (titration counts acid groups):

| Acid | Equivalent weight | 1 g of acid = g lactic equivalent |
|---|---|---|
| Lactic | 90.08 | 1.000 |
| Citric (anhydrous) | 64.04 | 1.407 |
| Malic | 67.04 | 1.344 |
| Tartaric | 75.04 | 1.200 |

*[Computed from molecular weights and number of acid groups; check before seeding.]*

### Ingredient field

| Field | Type | Rule |
|---|---|---|
| `titratable_acidity_pct` | number | % of the ingredient, as lactic acid equivalent. |

Seed values:
- **Dairy (milk, cream, skim milk powder):** MSNF % × 0.017. Goff gives this as the normal acidity of mixes, from the milk proteins and salts (pp. 142, 407). Storing it on each dairy ingredient means no separate MSNF term in the mix calculation, so nothing is double-counted.
- **Pure acids:** grams per 100 g × the factor above. A 50% citric solution is 50 × 1.407 = 70.4.
- **Cultured dairy (yogurt):** measured or label value; it varies with fermentation.
- **Fruit:** no source in this project. USDA doesn't report TA. Leave as a user-entered value, provenance "estimated" until measured.

It is a recipe-level coefficient like the other flags, so it belongs in the batch snapshot and the `coefficient_set_id` digest.

### Derived value

Mix TA = Σ (ingredient weight × `titratable_acidity_pct`) ÷ mix weight.

### Reference bands

| Style | TA, % as lactic | Source |
|---|---|---|
| Ice cream, gelato, custard | ≈ MSNF % × 0.017 (about 0.14–0.19) | Goff pp. 142, 407. Higher than this suggests developed (bacterial) acidity. |
| Frozen yogurt | about 0.30 | Goff p. 26 worked example |
| Sherbet | at least 0.35 | 21 CFR 135.140 (fruit sherbets); Goff p. 28 |
| Sherbet, by sugar level | 0.36 at 25–30% sugar, plus 0.01 for each 1% of sugar above 30% | Goff pp. 448–449 |
| Sorbet / water ice | 0.35–0.50 | Goff p. 450 |

Tier: **reference** for all. The sherbet 0.35% is a legal minimum, which matters only if the product is labeled sherbet in the US.

### Deliberately out of v1

- **Acid's effect on freezing.** At 0.3–0.5% it's a small term, and the Guelph method doesn't include it. *[Inference: small relative to sugars; not quantified.]*
- **Acid's effect on perceived sweetness.** Acid suppresses sweetness, but no published correction exists, so POD isn't adjusted.
- **Process: adding acid late.** Goff notes citric acid can precipitate milk proteins, so in sherbet it is added just before freezing (p. 448). That's a method step, and whether method steps are in the schema is still an open decision.

---

## 7. Values with no published support

- A separate % frozen target for any style
- Serving temperatures for frozen yogurt and fresh frozen custard
- POD bands for ice cream, sherbet and frozen yogurt
- Any band separating fior di latte from crema gelato
- The ~8% structural fat floor, and whether it scales with total fat
- A formula combining frozen share with fat or overrun to predict scoopability

---

## Sources

- Goff, H.D. & Hartel, R.W., *Ice Cream*, 7th ed., Springer, 2013. Table 1.7 (p. 15); Ch. 15 (pp. 437–453). Read from Mark's copy.
- Goff, H.D., *Ice Cream Technology e-Book*, University of Guelph: https://books.lib.uoguelph.ca/icecreamtechnologyebook/ (chapters: sweeteners; structure from the ice crystals; formulation considerations)
- University of Guelph Food Science, "Freezing Curve Calculation": https://www.uoguelph.ca/foodscience/sites/default/files/FreezingCurveCalculation.pdf
- Mullan, W.M.A., "Perfect ice cream or gelato… scoopability," dairyscience.info, 2013, rev. 2018: https://www.dairyscience.info/ice-cream/228-ice-cream-hardness.html
- 21 CFR 135.110, 135.140, 135.160: https://www.law.cornell.edu/cfr/text/21/135.110
- "Il gelato artigianale. Il bilanciamento della miscela," ilgelatoartigianale.info: https://www.ilgelatoartigianale.info/il-gelato/approfondimenti/il-gelato-artigianale-il-bilanciamento-della-miscela.kl
- Calzari, S., *Pasticceria Internazionale*, 19 Oct 2022: https://www.pasticceriainternazionale.it/2022/10/19/come-effettuare-in-modo-corretto-il-bilanciamento-del-gelato/
- De Felice, P., "Bilanciamento del gelato": https://www.pietrodefelice.it/portfolio-item/bilanciamento-del-gelato/
- gelatoperpassione.it, "Cos'è la bilanciatura?" (blog, weak): https://www.gelatoperpassione.it/cose-la-bilanciatura/
- Carpigiani Gelato University blog: https://www.gelatouniversity.com/en/blog/blast-freezer-gelato-shops
- Goff & Hartel 7th ed., additional pages used for the total solids floor: Table 2.3 (p. 21), international legal minimums (p. 22), mix balancing (p. 39), soft serve (p. 250), Table 14.4 (p. 427). Searched in the full text held in this project.
- Tobias, J., "Improve the Image of Your Ice Cream," Virginia Cooperative Extension HFST-540-1 (undated): https://vtechworks.lib.vt.edu/bitstream/handle/10919/75942/VCE_MFST540-1.pdf
- Guelph e-book, body and texture defects: https://books.lib.uoguelph.ca/icecreamtechnologyebook/chapter/body-and-texture-defects/
- Sipple, B. & Young, S., *Dairy Foods*, 18 Sep 2023: https://www.dairyfoods.com/articles/96722-the-definition-of-water-ices-and-sorbets-are-not-so-simple

## Verify before relying on these

- Goff Table 1.7 and Ch. 15 values were read directly from the book pages. The Italian, Guelph and Mullan values were gathered by a research agent and haven't been checked against the pages themselves.
- The 68–76% band is a judgment that spans the three sources. Only Goff's ~72% at −16 °C comes from a primary dairy-science source, and it is a typical value, not a target.
- The Italian sources don't say whether their PAC bands count lactose.
- Mark's empirical bands were computed in the old app's mixed conventions; `sprinkles-empirical-targets.md` recommends recomputing them in the seed-DB convention.
