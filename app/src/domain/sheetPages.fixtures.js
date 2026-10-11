// Olive Oil v1's Sheet blocks as the print route measures them, in CSS px, for
// layPages (sheetPages.js). Measured by `04-print-probe.mjs measure`
// (.planning/phases/04-prepare-the-next-version-for-making/) on the built
// route: the hidden measuring box laid at the printing engine's own content box.
// They agree with CONTRACT § 5 of sketch 010 where it states a number: the
// table is 755 px tall (755.1 here), the header row 27.4, the Step 6 group 73.6
// and the Step 8 group 109.6 in WebKit, the Total 31, the band 126, Before you
// start 144.9, the Ingredients heading 24.9 above the table, the gauges Sugar
// 74.3, Solids 91.3 and the basis note 120, all 20 apart. The Instructions'
// ten steps are CONTRACT § 5's (88.8, 113, 85.4, 134.5, 134.5, 94.8, 43.8, 94.8,
// 43.8, 43.8 at 672; step 2 133.8 and step 5 155.3 at 630), the heading 24.9
// above the first, 20 between steps, and the closing foot 22 tall under 32 of
// margin (04-08).
//
// Pure data. The fixtures are the one place the measured numbers live; the
// tests read them and nothing else does.

// Safari: WebKit's print gives a 630 x 900 content box (one CSS px is 0.8 pt).
export const OLIVE_OIL_V1_SAFARI = {
  box: { height: 900 },
  measure: {
    band: 126,
    before: 144.9,
    gap: 20,
    ingredientsHeading: 24.9,
    header: 27.4,
    total: 31,
    groups: [
      { head: 34.6, rows: [47.3, 44.4, 37, 37, 38] },
      { head: 34.6, rows: [47.3, 37, 37, 44.4, 37, 38] },
      { head: 34.6, rows: [39] },
      { head: 34.6, rows: [38, 37] },
    ],
    // Balance's six gauges, in the order buildFigures gives them: Freezing,
    // Sweetness, Fat (with its breakdown line), Milk solids, Sugar, Solids.
    balanceHeading: 24.9,
    gauges: [106.3, 106.3, 110.3, 91.3, 74.3, 91.3],
    gaugeGap: 20,
    basis: 120,
    basisGap: 20,
    instructionsHeading: 24.9,
    steps: [88.8, 133.8, 85.4, 134.5, 155.3, 94.8, 43.8, 94.8, 43.8, 43.8],
    stepGap: 20,
    footGap: 32,
    foot: 22,
  },
};

// Chrome and every other engine: a 672 x 960 content box.
export const OLIVE_OIL_V1_CHROME = {
  box: { height: 960 },
  measure: {
    band: 126,
    before: 144.9,
    gap: 20,
    ingredientsHeading: 24.9,
    header: 27.4,
    total: 30.5,
    groups: [
      { head: 35.1, rows: [46.2, 44.4, 37, 37, 38] },
      { head: 35.1, rows: [46.2, 37, 37, 44.4, 37, 38] },
      { head: 35.1, rows: [38.5] },
      { head: 35.1, rows: [37.5, 37.5] },
    ],
    balanceHeading: 24.9,
    gauges: [105, 105, 109, 91, 75, 91],
    gaugeGap: 20,
    basis: 84,
    basisGap: 20,
    instructionsHeading: 24.9,
    steps: [88.8, 113, 85.4, 134.5, 134.5, 94.8, 43.8, 94.8, 43.8, 43.8],
    stepGap: 20,
    footGap: 32,
    foot: 21,
  },
};
