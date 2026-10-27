// 11-06: the WebKit side-by-side spec for the creation editor's Instructions steps (sketch 014
// instructions-steps.html, CONTRACT section 2). Three panels, all cropped Sheet frames at 1366
// with a coarse pointer, each anchored on the element its board panel crops to:
//   pA1  no step: the heading rows of Before you start, Ingredients and Instructions, each in its
//        own anchored panel (pA1-before, pA1-ingredients, pA1-instructions);
//   pB1  a step just added: its number, lead-in, instruction, Required under each, and the targets
//        line with Add target and Preview step;
//   pE1  step 1 with its target, purpose and aside, Preview step open: the chip's two fields, the
//        Preview in the printed treatment, and step 1's targets line.
//
//   S="${TMPDIR:-/tmp}/sprinkles-11"
//   npm --prefix app run build -- --outDir "$S/dist-06" --emptyOutDir
//   PROBE_DIST="$S/dist-06" node .planning/phases/11-steps-structure-save-and-print/11-board-check.mjs \
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
// order pE1's table reads them: Whole milk, Skim milk powder and Sucrose in step 1, Heavy cream and
// Vanilla extract in step 2. Rows no step uses hold their one placeholder portion at step 1 (the
// draft's own shape, creationSteps.js); a row a step uses holds a portion at that step's key.
const ROW_DEFS = [
  ['r1', 'wholeMilk', '600', 1],
  ['r2', 'skimMilkPowder', '30', 1],
  ['r3', 'sucrose', '150', 1],
  ['r4', 'heavyCream', '250', 2],
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
      uses: ['r1', 'r2', 'r3'],
      targets: [{ label: 'temp', value: '85 °C' }],
      purpose: 'The powder dissolves without lumps when the milk is warm.',
      aside: 'Whisk the powder in slowly or it clumps.',
    },
    {
      n: 2,
      leadIn: 'Finish cold',
      instruction: 'Stir in the cream and vanilla. Chill overnight.',
      uses: ['r4', 'r5'],
      targets: [],
    },
  ],
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
      // A step just added. The step's uses line (the "change the ingredients" control), its acts row
      // and the table's step heads are plans 11-07 and 11-08's: they are left out of this panel, and
      // the table's heads are checked in their own table-anchored panel there, never in this
      // method-region scope.
      //
      // The step number's box is not compared here: the number is a grid item stretched to the whole
      // step's height, and the board's step holds a uses line and an acts row (292.3 px) that this
      // plan does not build (the build's step is 227.3 px). Its left, top and width match
      // (0,50 12 px wide); its place against the lead-in field is held by the lead-in's own box
      // (same top) and the number's font and text. Plan 11-08, Task 3 compares the number's box once
      // the step holds the uses line and the acts.
      id: 'pB1',
      draft: JUST_ADDED_DRAFT,
      anchor: METHOD_REGION,
      scope: METHOD_REGION,
      elements: [
        { selector: '.method-step__n', checks: ['font', 'text'] },
        { selector: '.prose-field--lead-in', checks: ['box', 'font', 'value', 'type'] },
        { selector: '.method-step__field textarea', checks: ['count', 'box'] },
        { selector: '.field-requirement', checks: ['count', 'box', 'text'] },
        { selector: '.method-step__targets > .text-control', checks: ['count', 'box', 'font', 'text'] },
      ],
    }),
    panel({
      // Step 1 with its target, purpose and aside, Preview step open.
      //
      // Why step 1 alone is measured by box: the board's step 1 holds its uses line with "change the
      // ingredients" and its acts row before step 2 begins (CONTRACT section 2's order), and those
      // arrive in plans 11-07 and 11-08, so step 2's targets line cannot stand where the board draws
      // it yet. Every element measured by box here sits in step 1 above its uses line (the chip's
      // fields are step 1's only target, the Preview sits before the uses line), and the preview's
      // li.method-step is not an .mk-step, so the box selector reaches the editor's first step only.
      // Plan 11-08, Task 3 measures both steps' targets lines, the uses lines and the acts once they
      // exist. Nothing is padded or spaced here to stand in for the missing rows.
      //
      // The D-22 exception, exactly: the board draws Add target and Preview step (Hide preview on
      // step 1) as the targets line's only direct .text-control children, four on the panel, and so
      // does the build. The build adds one remove control inside step 1's chip, after its value
      // field, which moves Add target and Hide preview right by the remove control's width and
      // nothing else. So the direct children are compared by count and text and not by box, the
      // chip's two fields by box and value (they come before the remove), and step 1's targets line
      // by box (its height and width stand). The remove control itself is proven by
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
        {
          selector: 'ol.method-steps > li.mk-step:first-child > .method-step__body > .method-step__targets',
          checks: ['box'],
        },
      ],
    }),
  ],
};
