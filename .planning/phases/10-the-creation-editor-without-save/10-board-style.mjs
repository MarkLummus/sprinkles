// 10-08: the Style region and the Balance it moves, held to sketch 013's style-menu-and-bands.html,
// side by side in Playwright WebKit with a coarse pointer at 1366. Fifteen target panels: the
// board's sixteen less tO1, "The menu open", which draws a stand-in for the browser's own list and
// is not a target (the build renders the browser's own select list, decision 21).
//
//   S="${TMPDIR:-/tmp}/sprinkles-10"
//   npm --prefix app run build -- --outDir "$S/dist-08" --emptyOutDir
//   PROBE_DIST="$S/dist-08" node .planning/phases/10-the-creation-editor-without-save/10-board-check.mjs \
//     .planning/phases/10-the-creation-editor-without-save/10-board-style.mjs
//
// Every panel on this board is a cropped frame: the Style panels are log_only and the Balance panels
// sheet_only, with no shell and no band, so no absolute box can match the full editor. The Style
// panels (tA1, tB1, tC1, tD1 to tD4, tF1 to tF3, tG1) name the anchor `.mk-region[aria-label="Style"]`,
// the first region of the log column on the board and in the app alike; their boxes are measured
// from its top-left and their selectors match inside it. The Balance panels (tA2, tB2, tC2, tD5) name
// the anchor `.notebook-body__sheet` and compare counts and text only, so the board's 632 px and
// Balance-height crop of the Sheet moves nothing compared.
//
// Each panel's draft holds the state the panel's region started from, and its steps do what the
// panel's caption says the maker did: the board's option values are the styles' names and the app's
// are their ids, so a style is chosen by label. Absences are declared, never inferred: the region
// head's Clear is drawn only for a picked style (p10.py line 170), so it is measured on the nine
// panels with a style picked and declared absent on tA1 (No style on arrival) and tG1 (after Clear).
// On every Style panel there is one temperature field, one unit, six bands and twelve band fields,
// and the three Balance selectors are drawn six times on all four Balance panels, so nothing else is
// absent.
//
// If a comparison fails, read both DOM rects and computed styles first. A FAIL that traces to the
// build departing from the board is fixed in the build. A FAIL that traces to a fixture or engine
// difference is reported with both values and is never patched into app CSS; nothing is dropped from
// this spec and the tolerance stays 1 px.
const BOARD = '.planning/sketches/013-creation-editor/style-menu-and-bands.html';

const STYLE_REGION = '.mk-region[aria-label="Style"]';
const SHEET = '.notebook-body__sheet';
const READY = '.notebook.mk-page';
const CLEAR = '.batch-row__head-acts .text-control';

// The six bands exactly as Philadelphia writes them (decision 14): PAC and Sugar stay blank.
const PHILADELPHIA = {
  style: 'philadelphia',
  serveTempC: '-14',
  targets: { pod: ['14', '18'], fat: ['10', '18'], msnf: ['8', '12'], solids: ['36', '42'] },
};

// What the board's Sheet draws behind the Balance panels: the name, the description, the two
// Before you start notes and the five rows (the board's own library is the original 26 entries).
const SHEET_DRAFT = {
  name: 'Vanilla',
  description: 'Plain and cold.',
  beforeYouStart: [{ text: 'Chill the mix overnight before churning.' }, { text: 'Keep the cream cold until it goes in.' }],
  rows: [
    { id: 'row-milk', libraryId: 'wholeMilk', portions: [{ step: 1, grams: '600' }] },
    { id: 'row-cream', libraryId: 'heavyCream', portions: [{ step: 1, grams: '250' }] },
    { id: 'row-powder', libraryId: 'skimMilkPowder', portions: [{ step: 1, grams: '30' }] },
    { id: 'row-sucrose', libraryId: 'sucrose', portions: [{ step: 1, grams: '150' }] },
    { id: 'row-vanilla', libraryId: 'vanillaExtract', portions: [{ step: 1, grams: '5' }] },
  ],
};

const choose = (label) => async (page) => {
  await page.selectOption(`${STYLE_REGION} .mk-menu`, { label });
};
const fill = (label, value) => async (page) => {
  await page.fill(`[aria-label="${label}"]`, value);
};
const clear = async (page) => {
  await page.click(`${STYLE_REGION} ${CLEAR}`);
};

const FAT_HIGH = 'Fat, target high';
const TEMPERATURE = 'Serving temperature, degrees Celsius';

// The Style panels' comparisons: the title, the menu, the temperature field and its unit, and the
// six bands with their labels, their twelve fields and their units.
const region = [
  { selector: `${STYLE_REGION} .region-name`, checks: ['box', 'font', 'text'] },
  { selector: '.mk-menu', checks: ['box', 'font', 'color', 'border', 'value'] },
  { selector: '.mk-field-row .ink-field', checks: ['box', 'value'] },
  { selector: '.mk-unit', checks: ['box', 'text'] },
  { selector: '.mk-band', checks: ['count', 'box'] },
  { selector: '.mk-band__label', checks: ['count', 'font', 'color', 'text'] },
  { selector: '.mk-band__ends .ink-field', checks: ['count', 'box', 'value'] },
  { selector: '.mk-band__unit', checks: ['count', 'text'] },
];
const clearMeasured = { selector: `${STYLE_REGION} ${CLEAR}`, checks: ['count', 'box', 'text'] };

const styleWith = (id, steps, draft) => ({
  id,
  width: 1366,
  route: '/notebook/new',
  ready: READY,
  library: 'original',
  draft: { name: 'Vanilla', ...draft },
  anchor: STYLE_REGION,
  steps,
  elements: [...region, clearMeasured],
});

// No style picked at the end: Clear is not drawn, and the panel declares it absent.
const styleNone = (id, steps, draft) => ({
  id,
  width: 1366,
  route: '/notebook/new',
  ready: READY,
  library: 'original',
  draft: { name: 'Vanilla', ...draft },
  anchor: STYLE_REGION,
  steps,
  elements: region,
  absent: [CLEAR],
});

// The Balance beside a style: the Sheet's six figures, their values, their deviation words and
// their anchors, each drawn six times.
const balance = [
  { selector: '.graduated-rule__value', checks: ['count', 'text'] },
  { selector: '.graduated-rule__deviation', checks: ['count', 'text'] },
  { selector: '.graduated-rule__anchors', checks: ['count', 'text'] },
];

const balanceOf = (id, steps, draft) => ({
  id,
  width: 1366,
  route: '/notebook/new',
  ready: READY,
  library: 'original',
  draft: { ...SHEET_DRAFT, ...draft },
  overflow: true,
  anchor: SHEET,
  steps,
  elements: balance,
});

export default {
  board: BOARD,
  panels: [
    // No style on arrival: everything blank, the temperature empty.
    styleNone('tA1', undefined, {}),
    balanceOf('tA2', undefined, {}),
    // Philadelphia picked from No style.
    styleWith('tB1', choose('Philadelphia'), {}),
    balanceOf('tB2', choose('Philadelphia'), {}),
    // Fat edited to 10 to 16 on a picked Philadelphia: the style stays picked.
    styleWith('tC1', fill(FAT_HIGH, '16'), PHILADELPHIA),
    balanceOf('tC2', fill(FAT_HIGH, '16'), PHILADELPHIA),
    // Each of the four styles, chosen from No style.
    styleWith('tD1', choose('Philadelphia'), {}),
    styleWith('tD2', choose('French'), {}),
    styleWith('tD3', choose('Gelato'), {}),
    styleWith('tD4', choose('Sorbet'), {}),
    // Sorbet's Sweetness 24 to 32 on the 0 to 40 rule.
    balanceOf('tD5', choose('Sorbet'), {}),
    // The serving temperature edited, emptied, and refilled by another style.
    styleWith('tF1', fill(TEMPERATURE, '-16'), PHILADELPHIA),
    styleWith('tF2', fill(TEMPERATURE, ''), PHILADELPHIA),
    styleWith('tF3', choose('Gelato'), { ...PHILADELPHIA, serveTempC: '-16' }),
    // After Clear on Philadelphia: No style, the bands stay, the temperature empties.
    styleNone('tG1', clear, PHILADELPHIA),
  ],
};
