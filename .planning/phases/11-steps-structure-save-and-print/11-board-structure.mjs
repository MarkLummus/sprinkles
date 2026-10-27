// 11-08: the WebKit side-by-side spec for the creation editor's structure controls (sketch 014
// add-remove-move.html, CONTRACT sections 3 and 4). Five panels, all cropped Sheet frames at 1366
// with a coarse pointer, each anchored at the Sheet (`.notebook-body__sheet`) and held to the
// column's height on both sides:
//   qA1  three steps and their rows: remove, Move up, Move down and Add step under every step, the
//        same three under every row, the first and last of each group off;
//   qB1  qA1 after Move down on step 1 pressed from the keyboard: the steps and their rows in the
//        new order, and focus on the moved step's own Move down;
//   qC1  qA1 after remove on step 2: its rows under Not in a step yet with Add to step, the third
//        step now second, and the Balance standing (no step's grams were split);
//   qD1  qA1 after Move down on Whole milk: step 1's rows in the moved order;
//   qE1  qC1 then Add to step on Heavy cream: the chooser in the acts line, focus on its Cancel.
//
//   S="${TMPDIR:-/tmp}/sprinkles-11"
//   npm --prefix app run build -- --outDir "$S/dist-08" --emptyOutDir
//   PROBE_DIST="$S/dist-08" node .planning/phases/11-steps-structure-save-and-print/11-board-check.mjs \
//     .planning/phases/11-steps-structure-save-and-print/11-board-structure.mjs --selftest
//
// If a comparison fails, read both DOM rects and computed styles first. A FAIL that traces to the
// build departing from the board is fixed in notebook.css or the one component that draws the
// element, to the board's own value. A FAIL that traces to a fixture or engine difference is
// reported with both values and is never patched into app CSS; the tolerance stays 1 px and
// nothing is dropped from this spec.
const BOARD = '.planning/sketches/014-steps-structure-save/add-remove-move.html';

// The editor is drawn only once its reads settle (plan 10-02).
const READY = '.notebook.mk-page';

const SHEET = '.notebook-body__sheet';

// The board's five rows, library ids from app/src/data/library.js, in the order qA1's table reads
// them: Whole milk, Skim milk powder and Sucrose in step 1, Heavy cream and Vanilla extract in
// step 2. A row a step uses holds one portion at that step's key.
const ROWS = [
  ['r1', 'wholeMilk', '600', 1],
  ['r2', 'skimMilkPowder', '30', 1],
  ['r3', 'sucrose', '150', 1],
  ['r4', 'heavyCream', '250', 2],
  ['r5', 'vanillaExtract', '5', 2],
].map(([id, libraryId, grams, step]) => ({ id, libraryId, portions: [{ step, grams }] }));

// qA1's draft: three steps. Each step's uses is in the order the board's table draws that step's
// rows (a step's uses is its row order). Step 1 holds one target and a purpose; step 3 uses
// nothing yet.
const THREE_STEPS_DRAFT = {
  name: 'Vanilla',
  description: 'Plain and cold.',
  beforeYouStart: [{ text: 'Chill the mix overnight before churning.' }, { text: 'Keep the cream cold until it goes in.' }],
  rows: ROWS,
  // The board's Balance reads against Philadelphia's four bands (qA1's rules say "target 14–18").
  style: 'philadelphia',
  targets: { pod: ['14', '18'], fat: ['10', '18'], msnf: ['8', '12'], solids: ['36', '42'] },
  serveTempC: '-14',
  method: [
    {
      n: 1,
      leadIn: 'Warm the milk',
      instruction: 'Whisk the milk powder and sugar into the milk. Heat, stirring, then take it off.',
      uses: ['r1', 'r2', 'r3'],
      targets: [{ label: 'temp', value: '85 °C' }],
      purpose: 'The powder dissolves without lumps when the milk is warm.',
    },
    {
      n: 2,
      leadIn: 'Finish cold',
      instruction: 'Stir in the cream and vanilla. Chill overnight.',
      uses: ['r4', 'r5'],
      targets: [],
    },
    {
      n: 3,
      leadIn: 'Churn',
      instruction: 'Churn, then harden in the freezer.',
      uses: [],
      targets: [],
    },
  ],
};

const panel = (extra) => ({
  width: 1366,
  route: '/notebook/new',
  ready: READY,
  library: 'original',
  anchor: SHEET,
  pageHeight: true,
  draft: THREE_STEPS_DRAFT,
  ...extra,
});

// Press a button by its accessible name with the keyboard, as the maker does: focus it, then Enter.
const pressByKeyboard = (label) => async (page) => {
  await page.focus(`[aria-label="${label}"]`);
  await page.keyboard.press('Enter');
};

const pressByTouch = (label) => async (page) => {
  await page.click(`[aria-label="${label}"]`);
};

// The elements every panel compares: the step numbers, each step's acts, the off moves, the step
// heads and rows of the table, the grams fields, each row's acts and the three heading acts.
const STRUCTURE_ELEMENTS = [
  { selector: '.method-step__n', checks: ['count', 'box', 'text'] },
  { selector: '.method-step__acts .text-control', checks: ['count', 'box', 'text'] },
  { selector: '.mk-off', checks: ['count', 'color', 'type'] },
  { selector: 'tr.ingredient-table__step-head', checks: ['count', 'box', 'text'] },
  { selector: '.ingredient-table tbody tr', checks: ['count', 'box'] },
  { selector: '.ingredient-table__plan-grams .ink-field', checks: ['count', 'value'] },
  { selector: '.mk-row-acts .text-control', checks: ['count', 'box', 'text'] },
  { selector: '.mk-head-act', checks: ['count', 'box', 'text'] },
];

export default {
  board: BOARD,
  panels: [
    panel({
      id: 'qA1',
      elements: STRUCTURE_ELEMENTS,
    }),
    panel({
      // Move down on step 1 by the keyboard. Focus stays on the moved step's own Move down, which is
      // now the second step's.
      id: 'qB1',
      steps: async (page) => {
        await pressByKeyboard('Step 1, move down')(page);
        await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Step 2, move down');
      },
      elements: [...STRUCTURE_ELEMENTS, { selector: '[aria-label="Step 2, move down"]', checks: ['count', 'box', 'text', 'focus'] }],
    }),
    panel({
      // remove on step 2: its two rows go back under Not in a step yet, each with Add to step, and
      // the third step is now the second. Nothing was split, so no portion line stands and the
      // Balance reads as before.
      id: 'qC1',
      steps: pressByTouch('Step 2, remove'),
      elements: [...STRUCTURE_ELEMENTS, { selector: '.graduated-rule__deviation', checks: ['count', 'text'] }],
      absent: ['.ingredient-table__portion-note'],
    }),
    panel({
      // Move down on Whole milk in step 1: the table reads Skim milk powder, Whole milk, Sucrose.
      id: 'qD1',
      steps: pressByTouch('Move Whole milk, 3.5% fat down'),
      elements: STRUCTURE_ELEMENTS,
    }),
    panel({
      // The qC1 state, then Add to step on Heavy cream: its acts become Cancel and one control per
      // step, and focus is on Cancel.
      id: 'qE1',
      steps: async (page) => {
        await pressByTouch('Step 2, remove')(page);
        await pressByTouch('Add Heavy cream, 36% fat to a step')(page);
        await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Heavy cream, 36% fat, cancel');
      },
      elements: [
        ...STRUCTURE_ELEMENTS,
        // The board's chooser carries no modifier class (its span is a plain .mk-row-acts), so the
        // step controls are found by the name they share: "Add <row> to step n".
        { selector: '[aria-label^="Add Heavy cream, 36% fat to step"]', checks: ['count', 'box', 'text'] },
        { selector: '[aria-label="Heavy cream, 36% fat, cancel"]', checks: ['count', 'box', 'focus'] },
      ],
    }),
  ],
};
