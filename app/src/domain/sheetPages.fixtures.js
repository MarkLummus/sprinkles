// Olive Oil v1's Sheet blocks as the print route measures them, in CSS px, for
// layPages (sheetPages.js). Measured by `04-print-probe.mjs measure`
// (.planning/phases/04-prepare-the-next-version-for-making/) on the built
// route: the hidden measuring box laid at the printing engine's own content box.
// They agree with CONTRACT § 5 of sketch 010 where it states a number: the
// table is 755 px tall (755.1 here), the header row 27.4, the Step 6 group 73.6
// and the Step 8 group 109.6 in WebKit, the Total 31, the band 126, Before you
// start 144.9, the Ingredients heading 24.9 above the table.
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
  },
};
