// 10-05: the WebKit side-by-side spec for sketch 013's creation editor (creation-editor.html).
// Plan 10-05 draws the band, the headnote and Before you start (panels eA1 and eB1, both full
// pages at 1366: their board roots hold `.shell`, so they name no anchor); plans 10-07 and 10-10
// extend this spec with the table, the remove panels and the page heights. Plan 10-07 adds the
// table to eA1 and eB1 and the remove panels eC1 and eC2 (cropped Sheet frames, anchored at
// `.notebook-body__sheet`). Plan 10-10 completes it for the final build: the worked panels hold
// the Philadelphia style, a scale and a problem, the Balance's deviation words are compared (and
// declared absent on eA1, which draws no Balance), the log column's regions and the side region
// are compared, the page heights are compared (the document on the full pages eA1 and eB1, the
// Sheet column's own height on the cropped eC1 and eC2) and the full pages are held for sideways
// overflow at the widths the board does not draw.
//
//   S="${TMPDIR:-/tmp}/sprinkles-10"
//   npm --prefix app run build -- --outDir "$S/dist-05" --emptyOutDir
//   PROBE_DIST="$S/dist-05" node .planning/phases/10-the-creation-editor-without-save/10-board-check.mjs \
//     .planning/phases/10-the-creation-editor-without-save/10-board-editor.mjs
//
// If a comparison fails, read both DOM rects and computed styles first. A FAIL that traces to the
// build departing from the board is fixed in the build. A FAIL that traces to a fixture or engine
// difference is reported with both values and is never patched into app CSS; nothing is dropped
// from this spec and the tolerance stays 1 px.
const EDITOR = '.planning/sketches/013-creation-editor/creation-editor.html';

// The editor is drawn only once its reads settle (plan 10-02).
const READY = '.notebook.mk-page';

// The board's five rows, in order (plan 10-07): library ids from app/src/data/library.js.
const BOARD_ROWS = [
  ['r1', 'wholeMilk', '600'],
  ['r2', 'heavyCream', '250'],
  ['r3', 'skimMilkPowder', '30'],
  ['r4', 'sucrose', '150'],
  ['r5', 'vanillaExtract', '5'],
].map(([id, libraryId, grams]) => ({ id, libraryId, portions: [{ step: 1, grams }] }));

const SHEET = '.notebook-body__sheet';

// What the board's worked panel holds beside the rows (plan 10-10): Philadelphia with its four
// bands as the strings the style writes, its serving temperature, one scale and one problem.
const WORKED_DRAFT = {
  name: 'Vanilla',
  description: 'Plain and cold.',
  beforeYouStart: [{ text: 'Chill the mix overnight before churning.' }, { text: 'Keep the cream cold until it goes in.' }],
  rows: BOARD_ROWS,
  style: 'philadelphia',
  targets: { pod: ['14', '18'], fat: ['10', '18'], msnf: ['8', '12'], solids: ['36', '42'] },
  serveTempC: '-14',
  scales: [{ key: 'scale-board-1', name: 'Creaminess', low: 'thin', high: 'rich', kind: 'goldilocks', group: 'declared' }],
  problems: ['Bitter'],
};

const SHEET_DRAFT = WORKED_DRAFT;

// The widths the boards do not draw, held for sideways overflow (RESEARCH Open Question 6).
const EXTRA_WIDTHS = [393, 744, 768, 1024];

// The table, compared the same way on the full page and in the crops.
const TABLE_ELEMENTS = [
  { selector: '.ingredient-table', checks: ['box'] },
  { selector: '.ingredient-table tbody tr', checks: ['count', 'box'] },
  { selector: '.ingredient-table__plan-grams .ink-field', checks: ['count', 'box', 'font', 'color', 'border', 'value'] },
  { selector: '.ingredient-table__col-name', checks: ['count', 'text'] },
  { selector: '.ingredient-table .text-control', checks: ['count', 'box', 'font', 'color', 'text'] },
  { selector: '.ingredient-table tbody .ingredient-table__col-numeric', checks: ['count', 'text'] },
  { selector: '.ingredient-table tfoot tr', checks: ['box', 'text'] },
];

const REMOVE_ELEMENTS = [
  { selector: '.ingredient-table tbody tr', checks: ['count', 'box'] },
  { selector: '.ingredient-table__col-name', checks: ['count', 'text'] },
  { selector: '.ingredient-table tbody .ingredient-table__col-numeric', checks: ['count', 'text'] },
  { selector: '.ingredient-table tfoot tr', checks: ['text'] },
  { selector: '.graduated-rule__value', checks: ['count', 'text'] },
  { selector: '.graduated-rule__deviation', checks: ['count', 'text'] },
];

export default {
  board: EDITOR,
  panels: [
    // eA1, just arrived: a name and nothing else. The band, the headnote with no prose, Before
    // you start with Add note alone, and no Balance.
    {
      id: 'eA1',
      width: 1366,
      route: '/notebook/new',
      ready: READY,
      library: 'current',
      overflow: true,
      pageHeight: true,
      extraWidths: EXTRA_WIDTHS,
      draft: { name: 'Vanilla' },
      elements: [
        { selector: '.notebook-recipe__form .ink-field', checks: ['box', 'font', 'color', 'border', 'value'] },
        { selector: '.notebook-recipe__form .prose-field', checks: ['box', 'font', 'color', 'border'] },
        { selector: '.notebook-ceremony > .notebook-caption', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.notebook-ceremony .ink-field', checks: ['box', 'font', 'color', 'border', 'value'] },
        { selector: '.notebook-ceremony .field-requirement', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.notebook-ceremony__actions button', checks: ['count', 'box', 'font', 'color', 'border', 'text'] },
        { selector: '.headnote h1', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.before-region .region-name', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.before-region .mk-add', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.ingredient-table-region > p', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.ingredient-table-region .mk-add', checks: ['box', 'font', 'color', 'text'] },
      ],
      absent: ['.headnote__prose', '.side-region', '.method-region', '.graduated-rule__deviation'],
    },
    // eB1, worked on: a description, two Before you start notes, the board's five rows, the
    // Philadelphia style, a scale and a problem. The side-region's box is compared here, now that
    // the bands are wired (plan 10-08), with the log column's regions and their names.
    {
      id: 'eB1',
      width: 1366,
      route: '/notebook/new',
      ready: READY,
      library: 'current',
      overflow: true,
      pageHeight: true,
      extraWidths: EXTRA_WIDTHS,
      draft: WORKED_DRAFT,
      elements: [
        { selector: '.headnote h1', checks: ['box', 'text'] },
        { selector: '.headnote__prose', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.authored__notes textarea', checks: ['count', 'box', 'font', 'color', 'border', 'value'] },
        { selector: '.authored__note-field .text-control', checks: ['count', 'box', 'font', 'color', 'text'] },
        { selector: '.before-region .mk-add', checks: ['box'] },
        ...TABLE_ELEMENTS,
        { selector: '.ingredient-table-region .mk-add', checks: ['box', 'text'] },
        { selector: '.graduated-rule__value', checks: ['count', 'text'] },
        { selector: '.graduated-rule__deviation', checks: ['count', 'text'] },
        { selector: '.side-region', checks: ['box'] },
        { selector: '.notebook-log .mk-region', checks: ['count', 'box'] },
        { selector: '.notebook-log .region-name', checks: ['count', 'text'] },
      ],
    },
    // eC1 and eC2, the remove before and after: cropped Sheet frames (no shell, no band), so they
    // are measured from their anchor, the Sheet, and never from the document. Both hold eB1's
    // draft, so the Sheet above the table is what the board's Sheet holds.
    {
      id: 'eC1',
      width: 1366,
      route: '/notebook/new',
      ready: READY,
      library: 'current',
      anchor: SHEET,
      pageHeight: true,
      draft: SHEET_DRAFT,
      elements: REMOVE_ELEMENTS,
    },
    {
      id: 'eC2',
      width: 1366,
      route: '/notebook/new',
      ready: READY,
      library: 'current',
      anchor: SHEET,
      pageHeight: true,
      draft: SHEET_DRAFT,
      steps: async (page) => {
        await page.locator('tr', { has: page.locator('input[aria-label="Skim milk powder, grams"]') }).getByRole('button', { name: /remove/i }).click();
        await page.waitForFunction(() => !document.querySelector('input[aria-label="Skim milk powder, grams"]'));
      },
      elements: REMOVE_ELEMENTS,
    },
  ],
};
