// 10-12: the ingredient picker and the row it lands, held to sketch 013's ingredient-picker.html,
// side by side in Playwright WebKit with a coarse pointer, at 1366 (kA1, kA2, kB1, kB2) and 393
// (kC1 to kC4), with the board's own 26-entry library (the build seeds 111, so every panel runs
// the engine's 'original' library; 10-picker-current.mjs runs the seeded one).
//
//   S="${TMPDIR:-/tmp}/sprinkles-10"
//   npm --prefix app run build -- --outDir "$S/dist-12" --emptyOutDir
//   PROBE_DIST="$S/dist-12" node .planning/phases/10-the-creation-editor-without-save/10-board-check.mjs \
//     .planning/phases/10-the-creation-editor-without-save/10-board-picker.mjs
//
// Every panel of this board is a sheet_only crop with no shell and no band (p10.py's sheet_only),
// so each names the anchor `.notebook-body__sheet` and leaves the scope to the anchor: boxes
// compare from the Sheet column's top-left, and `.mk-add` and every other selector match inside
// the Sheet only, never the app's Add scale or Add problem in the log column.
//
// The draft holds what the board's Sheet draws above and in the table: the name, the description
// and the two Before you start notes p10.py's sheet_only draws by default (they set where the
// table and the picker start below the anchor), and the board's two rows, Whole milk at 600 g and
// Heavy cream at 250 g, so those two entries read Added.
//
// Each panel lists its positive selectors in `elements` and its absent ones in `absent`, by state:
//   open (kA1, kC1)        absent: Clear filters, 'Not in the library yet', the focus outline
//   filtered (kA2, kC2)    absent: 'Not in the library yet', the focus outline
//   no match (kB1, kC3)    absent: the list, its rows and cells, the focus outline
//   after the pick (kB2, kC4)  absent: the picker, its list, its rows, 'Not in the library yet'
// A selector a state's panels neither measure nor declare absent is not compared there (the open
// panels' one `.mk-add`, Add note above the table, is not measured).
//
// If a comparison fails, read both DOM rects and computed styles first. A FAIL that traces to the
// build departing from the board is fixed in the build. A FAIL that traces to a fixture or engine
// difference is reported with both values and is never patched into app CSS; nothing is dropped
// from this spec and the tolerance stays 1 px.
const BOARD = '.planning/sketches/013-creation-editor/ingredient-picker.html';

const SHEET = '.notebook-body__sheet';
const READY = '.notebook.mk-page';

const DRAFT = {
  name: 'Vanilla',
  description: 'Plain and cold.',
  beforeYouStart: [{ text: 'Chill the mix overnight before churning.' }, { text: 'Keep the cream cold until it goes in.' }],
  rows: [
    { id: 'row-milk', libraryId: 'wholeMilk', portions: [{ step: 1, grams: '600' }] },
    { id: 'row-cream', libraryId: 'heavyCream', portions: [{ step: 1, grams: '250' }] },
  ],
};

const open = async (page) => {
  await page.click('.ingredient-table-region .mk-add');
  await page.waitForSelector('.pick');
};
const typed = (value) => async (page) => {
  await open(page);
  await page.fill('.pick .ing__filters input.ink-field', value);
};
const pickSucrose = async (page) => {
  await open(page);
  await page.click('.pick__row:has(.pick__name:text-is("Sucrose"))');
  await page.waitForSelector('.ingredient-table .mk-focus');
};

const FOCUS = '.ingredient-table .mk-focus';
const CLEAR = '.pick .ing__clear';
const NONE = '.pick__none';

// The picker's frame: the box, its head, the filters and the count.
const frame = [
  { selector: '.pick', checks: ['box', 'border'] },
  { selector: '.pick__head .pen-caption', checks: ['box', 'font', 'color', 'text'] },
  { selector: '.pick__head .text-control', checks: ['box', 'font', 'color', 'text'] },
  { selector: '.pick .ing__filters .ink-field', checks: ['count', 'box', 'font', 'color', 'border', 'value'] },
  { selector: '.pick .ing__count', checks: ['box', 'font', 'color', 'text'] },
];

// The list and everything in a row.
const list = [
  { selector: '.pick__list', checks: ['box'] },
  { selector: '.pick__row', checks: ['count', 'box'] },
  { selector: '.pick__name', checks: ['font', 'color', 'text'] },
  { selector: '.pick__sum', checks: ['font', 'color', 'text'] },
  { selector: '.pick__act', checks: ['font', 'color', 'text'] },
  { selector: '.pick__row--added', checks: ['count', 'color'] },
];

const clearFilters = { selector: CLEAR, checks: ['box', 'text'] };

// The landing: three rows, the new row's grams field with the focus outline, the two add
// controls in the Sheet and the six Balance figures.
const landing = [
  { selector: '.ingredient-table tbody tr', checks: ['count', 'box'] },
  { selector: FOCUS, checks: ['box', 'outline', 'focus', 'value'] },
  { selector: '.mk-add', checks: ['box', 'font', 'text'] },
  { selector: '.graduated-rule__value', checks: ['count', 'text'] },
];

const panel = (id, width, steps, elements, absent) => ({
  id,
  width,
  route: '/notebook/new',
  ready: READY,
  library: 'original',
  draft: DRAFT,
  overflow: true,
  anchor: SHEET,
  steps,
  elements,
  absent,
});

const open1 = (id, width) => panel(id, width, open, [...frame, ...list], [CLEAR, NONE, FOCUS]);
const milk = (id, width) => panel(id, width, typed('milk'), [...frame, clearFilters, ...list], [NONE, FOCUS]);
const noMatch = (id, width) =>
  panel(
    id,
    width,
    typed('tonka'),
    [...frame, clearFilters, { selector: NONE, checks: ['box', 'font', 'color', 'text'] }],
    ['.pick__list', '.pick__row', '.pick__name', '.pick__sum', '.pick__act', '.pick__row--added', FOCUS],
  );
const picked = (id, width) => panel(id, width, pickSucrose, landing, ['.pick', '.pick__list', '.pick__row', NONE]);

export default {
  board: BOARD,
  panels: [
    open1('kA1', 1366),
    milk('kA2', 1366),
    noMatch('kB1', 1366),
    picked('kB2', 1366),
    open1('kC1', 393),
    milk('kC2', 393),
    noMatch('kC3', 393),
    picked('kC4', 393),
  ],
};
