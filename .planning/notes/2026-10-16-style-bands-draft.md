# Draft balance bands for the four ice cream styles

Status: DRAFT for Mark's approval (decision 17, Mark's List `look-style-bands`). Nothing ships until Mark approves or changes each number. Phase 9 seeds the approved values as rows in the styles table (LIB-09); the maker can edit a band after choosing a style (MAKE-09).

**Where the numbers come from.** The repo holds no band reference for these styles. The only authored band is Mark's own olive oil band (`app/src/data/olive-oil.js`: PAC 22–26, POD 12–16, fat 16–20, milk solids 7.5–10, solids 38–42), which is a recipe target, not a style default. The numbers below are Claude's drafts from commonly cited home and professional ice cream balance ranges, not checked against a source in the repo. Treat every number as unverified until Mark approves it.

**Scale.** Percent of the mix by weight, and PAC and POD on the app's own scale (the same scale as the olive oil band above, where the library's sucrose is 100). A blank band means the style leaves that figure unbanded.

| Style | PAC | POD | Fat % | Milk solids % | Sugar % | Total solids % |
|-------|-----|-----|-------|---------------|---------|----------------|
| Philadelphia (no egg) | 24–28 | 14–18 | 12–16 | 9–11 | 14–17 | 36–40 |
| French (egg custard) | 24–28 | 14–18 | 12–16 | 8–11 | 14–17 | 38–42 |
| Gelato | 26–30 | 16–20 | 6–10 | 9–12 | 16–20 | 36–40 |
| Sorbet | 28–34 | 26–32 | blank | blank | 26–32 | 28–34 |

**Notes for review**
- French differs from Philadelphia only by the egg yolk: slightly more total solids, and its fat includes the yolk's.
- Gelato carries less fat and more sugar than the two creams, and is served warmer.
- Sorbet has no dairy, so fat and milk solids are blank.
- The seeded recipes (all marked Gelato) keep their own authored targets; a style band is only the default a new recipe starts from. Olive oil's own fat band (16–20) is well above the Gelato draft (6–10); that is the recipe's choice, not a mismatch to fix.
