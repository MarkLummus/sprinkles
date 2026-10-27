// 11-06 and 11-08: the WebKit side-by-side spec for the creation editor's Instructions steps (sketch
// 014 instructions-steps.html, CONTRACT section 2). Cropped Sheet frames at 1366 with a coarse
// pointer, each anchored on the element its board panel crops to:
//   pA1  no step: the heading rows of Before you start, Ingredients and Instructions, each in its
//        own anchored panel (pA1-before, pA1-ingredients, pA1-instructions), and the flat table's
//        rows and acts (pA1-table);
//   pB1  a step just added: its number, lead-in, instruction, Required under each, the targets
//        line with Add target and Preview step, and the acts row (the step's remove, moves and
//        Add step); pB1-table is the table over it, every row under Not in a step yet;
//   pC1  two steps worked on, step 2's Uses checklist open: step 2 (pC1-step2) and the table under
//        its step heads (pC1-table);
//   pD1  Whole milk in both steps, 400 g and 200 g: the table's heads, rows and portion lines;
//   pE1  step 1 with its target, purpose and aside, Preview step open: the chip's two fields, the
//        Preview in the printed treatment, and both steps' targets lines, uses lines and acts.
//
//   S="${TMPDIR:-/tmp}/sprinkles-11"
//   npm --prefix app run build -- --outDir "$S/dist-08" --emptyOutDir
//   PROBE_DIST="$S/dist-08" node .planning/phases/11-steps-structure-save-and-print/11-board-check.mjs \
//     .planning/phases/11-steps-structure-save-and-print/11-board-steps.mjs --selftest
//
// If a comparison fails, read both DOM rects and computed styles first. A FAIL that traces to the
// build departing from the board is fixed in notebook.css or the one component that draws the
// element, to the board's own value. A FAIL that traces to a fixture or engine difference is
// reported with both values and is never patched into app CSS; the tolerance stays 1 px and
// nothing is dropped beyond the later plans' elements named below.
const STEPS = '.planning/sketches/014-steps-structure-save/instructions-steps.html';

// The editor is drawn only once its reads settle (plan 10-02).
const READY = '.notebook.mk-page';

const METHOD_REGION = 'section.method-region';

// The board's five rows (plan 10-07's BOARD_ROWS), library ids from app/src/data/library.js, in the
// order the board's draft holds them (the order its flat table reads them and its Uses checklist
// lists them): Whole milk, Heavy cream, Skim milk powder, Sucrose, Vanilla extract. Step 1 uses
// Whole milk, Skim milk powder and Sucrose, step 2 Heavy cream and Vanilla extract. Rows no step
// uses hold their one placeholder portion at step 1 (the draft's own shape, creationSteps.js); a
// row a step uses holds a portion at that step's key.
const ROW_DEFS = [
  ['r1', 'wholeMilk', '600', 1],
  ['r2', 'heavyCream', '250', 2],
  ['r3', 'skimMilkPowder', '30', 1],
  ['r4', 'sucrose', '150', 1],
  ['r5', 'vanillaExtract', '5', 2],
];
const unplacedRows = ROW_DEFS.map(([id, libraryId, grams]) => ({ id, libraryId, portions: [{ step: 1, grams }] }));
const placedRows = ROW_DEFS.map(([id, libraryId, grams, step]) => ({ id, libraryId, portions: [{ step, grams }] }));

const BASE_DRAFT = {
  name: 'Vanilla',
  description: 'Plain and cold.',
  beforeYouStart: [{ text: 'Chill the mix overnight before churning.' }, { text: 'Keep the cream cold until it goes in.' }],
};

// pA1: the rows are unplaced and there is no step.
const NO_STEP_DRAFT = { ...BASE_DRAFT, rows: unplacedRows };

// pB1: one step just added, empty, the rows still unplaced.
const JUST_ADDED_DRAFT = {
  ...NO_STEP_DRAFT,
  method: [{ n: 1, leadIn: '', instruction: '', uses: [], targets: [] }],
};

// pE1: the board's two steps. Step 1 holds one target, a purpose and an aside; step 2 holds neither.
const TWO_STEPS_DRAFT = {
  ...BASE_DRAFT,
  rows: placedRows,
  method: [
    {
      n: 1,
      leadIn: 'Warm the milk',
      instruction: 'Whisk the milk powder and sugar into the milk. Heat, stirring, then take it off.',
      uses: ['r1', 'r3', 'r4'],
      targets: [{ label: 'temp', value: '85 °C' }],
      purpose: 'The powder dissolves without lumps when the milk is warm.',
      aside: 'Whisk the powder in slowly or it clumps.',
    },
    {
      n: 2,
      leadIn: 'Finish cold',
      instruction: 'Stir in the cream and vanilla. Chill overnight.',
      uses: ['r2', 'r5'],
      targets: [],
    },
  ],
};

// pC1: the board's two steps worked on. Step 1 holds a target and a purpose (no aside); step 2's
// Uses checklist is open. Each step's uses is in the order the board's table draws that step's rows.
const WORKED_STEPS = [
  {
    n: 1,
    leadIn: 'Warm the milk',
    instruction: 'Whisk the milk powder and sugar into the milk. Heat, stirring, then take it off.',
    uses: ['r1', 'r3', 'r4'],
    targets: [{ label: 'temp', value: '85 °C' }],
    purpose: 'The powder dissolves without lumps when the milk is warm.',
  },
  {
    n: 2,
    leadIn: 'Finish cold',
    instruction: 'Stir in the cream and vanilla. Chill overnight.',
    uses: ['r2', 'r5'],
    targets: [],
  },
];
const TWO_STEPS_WORKED_DRAFT = { ...BASE_DRAFT, rows: placedRows, method: WORKED_STEPS };

// pD1: Whole milk in both steps, 400 g in step 1 and 200 g in step 2, where it reads last: step 2's
// uses names Heavy cream, Vanilla extract, Whole milk, in that order.
const SPLIT_ROWS = placedRows.map((row) =>
  row.id === 'r1' ? { ...row, portions: [{ step: 1, grams: '400' }, { step: 2, grams: '200' }] } : row,
);
const SPLIT_DRAFT = {
  ...BASE_DRAFT,
  rows: SPLIT_ROWS,
  method: [WORKED_STEPS[0], { ...WORKED_STEPS[1], uses: ['r2', 'r5', 'r1'] }],
};

const panel = (extra) => ({
  width: 1366,
  route: '/notebook/new',
  ready: READY,
  library: 'current',
  ...extra,
});

// A heading row: the region name and the add control in the Show/Hide control's look.
const HEAD_ROW_ELEMENTS = [
  { selector: '.region-name', checks: ['box', 'font', 'text'] },
  { selector: '.mk-head-act', checks: ['box', 'font', 'color', 'text', 'type'] },
];

// The table with no step heads: rows, their grams fields and acts, the off moves.
const TABLE_ELEMENTS = [
  { selector: '.ingredient-table tbody tr', checks: ['count', 'box'] },
  { selector: '.ingredient-table__plan-grams .ink-field', checks: ['count', 'value', 'font'] },
  { selector: '.mk-row-acts .text-control', checks: ['count', 'box', 'text'] },
  { selector: '.mk-off', checks: ['count', 'color', 'type'] },
];

// The table under its step heads: the heads (their words and face) and the rows and acts under them.
const TABLE_UNDER_HEADS = [{ selector: 'tr.ingredient-table__step-head', checks: ['count', 'text', 'font'] }, ...TABLE_ELEMENTS];

export default {
  board: STEPS,
  panels: [
    panel({
      id: 'pA1',
      label: 'pA1-before',
      draft: NO_STEP_DRAFT,
      anchor: '.before-region .mk-head-row',
      elements: HEAD_ROW_ELEMENTS,
    }),
    panel({
      id: 'pA1',
      label: 'pA1-ingredients',
      draft: NO_STEP_DRAFT,
      anchor: '.ingredient-table-region .mk-head-row',
      elements: HEAD_ROW_ELEMENTS,
    }),
    panel({
      // The Instructions heading row alone: the region holds no step, so it is the heading row and
      // nothing else. The anchor is the row; the scope is the region, so the absence of a list is
      // read over the whole region.
      id: 'pA1',
      label: 'pA1-instructions',
      draft: NO_STEP_DRAFT,
      anchor: '.method-region .mk-head-row',
      scope: METHOD_REGION,
      elements: HEAD_ROW_ELEMENTS,
      absent: ['ol.method-steps'],
    }),
    panel({
      // The flat table of rows with no step, each with its acts (remove, Move up, Move down): the
      // first row's Move up and the last row's Move down are off. Anchored at the Ingredients
      // region, so the table's boxes are measured from its top-left.
      id: 'pA1',
      label: 'pA1-table',
      draft: NO_STEP_DRAFT,
      anchor: '.ingredient-table-region',
      elements: TABLE_ELEMENTS,
    }),
    panel({
      // A step just added. The step number is a grid item stretched to the whole step's height, so
      // its box is compared now that the step holds its uses line and its acts row (plan 11-06
      // left it uncompared until they stood). The step heads live in the table, never inside this
      // method-region scope: they are checked in pB1-table.
      id: 'pB1',
      draft: JUST_ADDED_DRAFT,
      anchor: METHOD_REGION,
      scope: METHOD_REGION,
      elements: [
        { selector: '.method-step__n', checks: ['box', 'font', 'text'] },
        { selector: '.prose-field--lead-in', checks: ['box', 'font', 'value', 'type'] },
        { selector: '.method-step__field textarea', checks: ['count', 'box'] },
        { selector: '.field-requirement', checks: ['count', 'box', 'text'] },
        { selector: '.method-step__targets > .text-control', checks: ['count', 'box', 'font', 'text'] },
        { selector: '.method-step__acts .text-control', checks: ['count', 'box', 'text'] },
        { selector: '.mk-off', checks: ['count', 'color', 'type'] },
      ],
    }),
    panel({
      // The table over the step just added: every row under Not in a step yet, each with Add to step
      // at the end of its acts line, the only step's Move controls off.
      id: 'pB1',
      label: 'pB1-table',
      draft: JUST_ADDED_DRAFT,
      anchor: '.ingredient-table-region',
      elements: [
        { selector: 'tr.ingredient-table__step-head', checks: ['count', 'text', 'font'] },
        { selector: '.ingredient-table tbody tr', checks: ['count', 'box'] },
        { selector: '.mk-row-acts .text-control', checks: ['count', 'box', 'text'] },
      ],
    }),
    panel({
      // Two steps worked on, step 2's Uses checklist open (Step 2, change the ingredients pressed).
      // Step 2 is the second .mk-step, since step 1's acts row sits above it; its uses line, the
      // checklist's box and its five items are compared.
      id: 'pC1',
      label: 'pC1-step2',
      draft: TWO_STEPS_WORKED_DRAFT,
      anchor: 'ol.method-steps > li.mk-step:nth-child(2)',
      steps: async (page) => {
        await page.click('[aria-label="Step 2, change the ingredients"]');
        await page.waitForSelector('fieldset.method-step__uses');
      },
      elements: [
        { selector: '.method-step__uses-line', checks: ['box', 'text'] },
        { selector: 'fieldset.method-step__uses', checks: ['box'] },
        { selector: '.method-step__uses-item', checks: ['count', 'box', 'text'] },
      ],
    }),
    panel({
      // The same state's table: the step heads with their lead-ins, each step's rows in that step's
      // own order, the grams fields, and no portion line (nothing is split).
      id: 'pC1',
      label: 'pC1-table',
      draft: TWO_STEPS_WORKED_DRAFT,
      anchor: '.ingredient-table-region',
      steps: async (page) => {
        await page.click('[aria-label="Step 2, change the ingredients"]');
        await page.waitForSelector('fieldset.method-step__uses');
      },
      elements: TABLE_UNDER_HEADS,
      absent: ['.ingredient-table__portion-note'],
    }),
    panel({
      // Whole milk in both steps, 400 g and 200 g. The board now draws Whole milk's line under Step
      // 2 as that step's last row (its uses names Heavy cream, Vanilla extract, Whole milk), so the
      // whole tbody is measured. The portion lines are held by count and font and not by text or
      // box: the board writes "400 g of 600 g" and the build's formatPortionLine writes "400 g of
      // 600.0 g" (formatGrams prints one decimal, as the reading branch always has), so their text
      // differs by ".0" and their width by one character. That difference is recorded in the
      // summary for Sid, never patched into the build.
      id: 'pD1',
      label: 'pD1-table',
      draft: SPLIT_DRAFT,
      anchor: '.ingredient-table-region',
      elements: [
        ...TABLE_UNDER_HEADS,
        { selector: '.ingredient-table__portion-note', checks: ['count', 'font', 'type'] },
      ],
    }),
    panel({
      // Step 1 with its target, purpose and aside, Preview step open, and the step's uses line and
      // acts row now standing between the two steps as the board draws them (CONTRACT section 2's
      // order): both steps' targets lines, the uses lines and the acts rows are measured, step 2's
      // targets line being placed by the controls above it.
      //
      // The D-22 exception, exactly: the board draws Add target and Preview step (Hide preview on
      // step 1) as the targets line's only direct .text-control children, four on the panel, and so
      // does the build. The build adds one remove control inside step 1's chip, after its value
      // field, which moves Add target and Hide preview right by the remove control's width and
      // nothing else. So the direct children are compared by count and text and not by box, the
      // chip's two fields by box and value (they come before the remove), and each step's targets
      // line by box (its height and width stand). The remove control itself is proven by
      // CreationSteps.test.jsx and CreationFlow.test.jsx, not against a board.
      id: 'pE1',
      draft: TWO_STEPS_DRAFT,
      anchor: METHOD_REGION,
      scope: METHOD_REGION,
      steps: async (page) => {
        await page.click('[aria-label="Step 1, preview the step"]');
        await page.waitForSelector('.mk-preview');
      },
      elements: [
        { selector: '.mk-preview', checks: ['box', 'border'] },
        { selector: '.mk-preview__cue', checks: ['box', 'font', 'text', 'type'] },
        { selector: '.mk-preview .method-step__lead', checks: ['box', 'font', 'text'] },
        { selector: '.mk-preview .target-chip__label', checks: ['box', 'font', 'text', 'type'] },
        { selector: '.mk-preview .target-chip__value', checks: ['box', 'font', 'text', 'type'] },
        { selector: '.mk-preview .method-step__purpose', checks: ['box', 'font', 'text', 'type'] },
        { selector: '.mk-preview .method-step__aside', checks: ['box', 'font', 'text', 'border', 'type'] },
        { selector: '.target-chip__label-field', checks: ['box', 'value'] },
        { selector: '.target-chip__value-field', checks: ['box', 'value'] },
        { selector: '.method-step__targets > .text-control', checks: ['count', 'text'] },
        { selector: '.mk-step > .method-step__body > .method-step__targets', checks: ['count', 'box'] },
        { selector: '.method-step__uses-line', checks: ['count', 'box', 'text'] },
        { selector: '.method-step__acts .text-control', checks: ['count', 'box', 'text'] },
      ],
    }),
  ],
};
