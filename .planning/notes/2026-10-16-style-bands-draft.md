# Draft balance bands for the four ice cream styles

Status: DRAFT for Mark's approval (decision 17, Mark's List `look-style-bands`). Nothing ships until Mark approves or changes each number. Phase 9 seeds the approved values as rows in the styles table (LIB-09); the maker can edit a band after choosing a style (MAKE-09).

**Source (revised 2026-10-16).** Mark's own research, `~/Downloads/Balance Bands/` (`balance-model-reference.md` §7, `balance-seed.json`), replaces Claude's first draft, which had no source in the repo. Mark's ranges are practice-based and unsourced by his own note, so they are his working values, not published standards. The four styles map to his dessert types: Philadelphia is his Ice cream; French is his Frozen custard, hardened profile; Gelato and Sorbet carry over. His Sherbet, Water ice, Soft serve and Frozen custard fresh profile are not among the four styles.

**Scale.** Percent of the mix by weight. POD is on Mark's scale and the app's (sucrose = 100 per 100 g of mix). The app's PAC is per 100 g of mix; Mark's model counts PAC per kg, so the app's PAC is his figure divided by 10 (olive oil v1 computes 24.1 in the app, 241 on his scale). A blank means the style leaves that figure unbanded.

| Style | PAC | POD | Fat % | Milk solids % | Sugar % | Total solids % |
|-------|-----|-----|-------|---------------|---------|----------------|
| Philadelphia (his Ice cream) | see below | 14–18 | 10–18 | 8–12 | blank | 36–42 |
| French (his Frozen custard, hardened) | see below | 14–18 | 10–14 | 8–11 | blank | 38–42 |
| Gelato | see below | 16–22 | 4–9 | 8–12 | blank | 32–42 |
| Sorbet | see below | 24–32 | blank | blank | blank | 26–36 |

**PAC.** Mark's model seeds no PAC range: a recipe computes its own PAC target from its serve temperature, water and milk solids, and the target moves about 29% between a -14 °C cabinet and a -18 °C home freezer. His sanity values (shop cabinet, midpoint composition), on the app's scale, are Philadelphia 28.6 (23.9–33.3), French 28.3 (23.7–32.9), Gelato 26.1 (22.4–29.7), Sorbet 37.3 (32.0–42.6). Mark's List `decide-style-pac-band` asks whether to seed them or leave PAC blank.

**Sugar.** Mark's model has no sugar-percent range (POD stands in for sweetness), so the sugar band is blank for all four.

**Not figures in the app.** His egg yolk, overrun, stabilizer and emulsifier ranges, default serve temperature, equipment class and calibration family are outside the six balance figures. Mark's List `decide-style-extra-fields` asks whether the styles table carries them in v2.0.

**First draft, superseded.** Philadelphia 24–28 / 14–18 / 12–16 / 9–11 / 14–17 / 36–40; French 24–28 / 14–18 / 12–16 / 8–11 / 14–17 / 38–42; Gelato 26–30 / 16–20 / 6–10 / 9–12 / 16–20 / 36–40; Sorbet 28–34 / 26–32 / blank / blank / 26–32 / 28–34 (PAC / POD / fat / milk solids / sugar / solids).
