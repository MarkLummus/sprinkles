# Style seed content: the four ice cream styles

Status: APPROVED by Mark, 2026-10-17 (Mark's List `look-style-bands`, `decide-style-pac-band`, `decide-style-extra-fields`). Phase 9 seeds these as rows in the styles table (LIB-09); the maker can edit a band after choosing a style (MAKE-09). Where this note and a later Mark decision differ, the decision wins.

**Source.** Mark's own research, `~/Downloads/Balance Bands/` (`balance-model-reference.md` section 7, `balance-seed.json`, version 0.1.0, provisional). The ranges are practice-based and unsourced by his own note, so they are his working values, not published standards. The four styles map to his dessert types: Philadelphia is his Ice cream; French is his Frozen custard, hardened profile; Gelato and Sorbet carry over. His Sherbet, Water ice, Soft serve and Frozen custard fresh profile are not among the four styles.

**Scale.** Percent of the mix by weight. POD is on Mark's scale and the app's (sucrose = 100 per 100 g of mix). The app's PAC is per 100 g of mix, so it is Mark's per-kg figure divided by 10 (olive oil v1 computes 24.1 in the app, 241 on his scale). A blank means the style leaves that figure unbanded.

## The six balance bands (approved)

| Style | PAC | POD | Fat % | Milk solids % | Sugar % | Total solids % |
|-------|-----|-----|-------|---------------|---------|----------------|
| Philadelphia | blank | 14-18 | 10-18 | 8-12 | blank | 36-42 |
| French | blank | 14-18 | 10-14 | 8-11 | blank | 38-42 |
| Gelato | blank | 16-22 | 4-9 | 8-12 | blank | 32-42 |
| Sorbet | blank | 24-32 | blank | blank | blank | 26-36 |

PAC is blank for all four (`decide-style-pac-band`): Mark's model computes a PAC target per recipe from its serve temperature, and that target moves about 29% between a -14 C cabinet and a -18 C home freezer. Sugar is blank because Mark's model has no sugar-percent range.

## The other fields the styles table also carries (approved, stored and not read in v2.0)

Mark: "keep it all in the seed table. We can worry about how/if we display later" (`decide-style-extra-fields`). Taken from `balance-seed.json`.

| Style | Egg yolk % | Overrun % | Stabilizer % | Emulsifier % | Default serve temp C (min to max) | Default equipment class | Calibration family |
|-------|-----------|-----------|--------------|--------------|-----------------------------------|-------------------------|--------------------|
| Philadelphia | 0-5 | 25-100 | 0.1-0.5 | 0.1-0.3 | -14 (-16 to -12) | dipping_cabinet | dairy_scooped |
| French | at least 1.4 (typical 2-4) | 20-40 | 0.1-0.5 | 0.1-0.3 | -14 (-16 to -12) | dipping_cabinet | dairy_scooped |
| Gelato | 0-3 | 20-35 | 0.1-0.5 | 0.1-0.3 | -12.5 (-14 to -11) | gelato_cabinet | dairy_scooped |
| Sorbet | 0 | 0-30 | 0.1-0.5 | 0 | -14 (-16 to -12) | dipping_cabinet | nondairy_scooped |

The equipment class and the calibration family are stored on the style as plain ids. Whether the equipment classes (serve temperatures) and the calibration families (frozen-fraction f) are also tables is not decided; Phase 9's discussion settles it. Mark's serving-equipment memo (`decision-xx-serving-equipment.md`) is a separate, unadopted proposal written for a different stack and is not applied.
