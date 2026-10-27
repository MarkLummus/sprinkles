// 11-04: the WebKit side-by-side spec for the Sheet's read-only steps in the printed treatment
// (decision 014 2, sketch 014 CONTRACT section 7). Sketch 014's vC1 (save.html, the saved recipe's
// page) and fA1 (first-version.html) draw Vanilla's three reading steps: the tag row with no box, the
// caps word "why", an em dash and the sentence, all upright. Task 1 holds the built reading page to
// both. Task 2 holds the two other read-only branches of Method.jsx to fA1's reading steps as well:
// the version pen's closed steps (fA1-pen: the Next version pen opened on the seeded root) and Show
// changes (fA1-changes: a seeded child of the root), since each is its own markup.
//
//   S="${TMPDIR:-/tmp}/sprinkles-11"
//   npm --prefix app run build -- --outDir "$S/dist-04" --emptyOutDir
//   PROBE_DIST="$S/dist-04" node .planning/phases/11-steps-structure-save-and-print/11-board-check.mjs \
//     .planning/phases/11-steps-structure-save-and-print/11-board-reading.mjs --selftest
//
// If a comparison fails, read both DOM rects and computed styles first. A FAIL that traces to the
// build departing from the board is fixed in notebook.css with the board's own value; one that
// traces to the fixture (the seeded version not holding what the board draws) is fixed in this spec.
// The tolerance stays 1 px and nothing is dropped.
import { library } from '../../../app/src/data/library.js';
import { createRecipe } from '../../../app/src/domain/newRecipe.js';
import { rowFromLibraryRecord } from '../../../app/src/domain/versionRow.js';
import { codeFromVersionId } from '../../../app/src/domain/sheetCode.js';

const SAVE = '.planning/sketches/014-steps-structure-save/save.html';
const FIRST_VERSION = '.planning/sketches/014-steps-structure-save/first-version.html';

// The engine's fixed ISO (11-board-check.mjs FIXED_ISO).
const NOW = '2026-10-20T12:00:00.000Z';

// The five rows the board's table draws: Whole milk, Skim milk powder and Sucrose in step 1,
// Heavy cream and Vanilla extract in step 2. Library ids from app/src/data/library.js.
const ROWS = [
  ['r1', 'wholeMilk', 600, 1],
  ['r2', 'skimMilkPowder', 30, 1],
  ['r3', 'sucrose', 150, 1],
  ['r4', 'heavyCream', 250, 2],
  ['r5', 'vanillaExtract', 5, 2],
].map(([id, libraryId, grams, step]) =>
  rowFromLibraryRecord({ id: libraryId, entry: library[libraryId] }, { id, grams, step }),
);

// The three reading steps vC1 and fA1 draw. Step 1 carries one target and a purpose; none has an aside.
const METHOD = [
  {
    n: 1,
    leadIn: 'Warm the milk',
    instruction: 'Whisk the milk powder and sugar into the milk. Heat, stirring, then take it off.',
    targets: [{ label: 'temp', value: '85 °C' }],
    purpose: 'The powder dissolves without lumps when the milk is warm.',
    removed: false,
    uses: ['r1', 'r2', 'r3'],
  },
  {
    n: 2,
    leadIn: 'Finish cold',
    instruction: 'Stir in the cream and vanilla. Chill overnight.',
    removed: false,
    uses: ['r4', 'r5'],
  },
  {
    n: 3,
    leadIn: 'Churn',
    instruction: 'Churn, then harden in the freezer.',
    removed: false,
    uses: [],
  },
];

const BEFORE_YOU_START = [
  { text: 'Chill the mix overnight before churning.', inheritedFrom: null },
  { text: 'Keep the cream cold until it goes in.', inheritedFrom: null },
];

function seededRoot(method = METHOD) {
  const { version } = createRecipe(
    {
      name: 'Vanilla',
      versionLabel: 'Version 1',
      rows: ROWS,
      description: 'Plain and cold.',
      method,
      authored: { beforeYouStart: BEFORE_YOU_START },
    },
    { recipeId: 'vanilla', versionId: 'vanilla-v1', now: NOW },
  );
  return version;
}

const RECIPES = [{ id: 'vanilla', name: 'Vanilla', description: 'Plain and cold.' }];

// The root: what the reading page (vC1, fA1) and the Next version pen hold.
const ROOT_SEED = { recipes: RECIPES, versions: [seededRoot()] };

// A child of the root for Show changes: step 1 unchanged, step 2 given a changed and a removed target
// against the root. The root of this seed carries two targets on step 2 for the child to change and drop.
function showChangesSeed() {
  const rootMethod = structuredClone(METHOD);
  rootMethod[1].targets = [
    { label: 'hold', value: '2 min' },
    { label: 'chill', value: '8 h' },
  ];
  const root = seededRoot(rootMethod);
  const child = structuredClone(root);
  child.id = 'vanilla-v2';
  child.parentVersionId = 'vanilla-v1';
  child.parentVersionLabel = 'Version 1';
  child.versionLabel = 'Version 2';
  child.reason = 'Warmer';
  child.sheetCode = codeFromVersionId('vanilla-v2');
  child.method[1].targets = [{ label: 'hold', value: '3 min' }];
  return { recipes: RECIPES, versions: [root, child] };
}

const ROUTE = '/notebook/vanilla/vanilla-v1';

// The reading steps, element by element. Every typography check reads the properties the tag row,
// the why label and the lead set (box, font, text, type); the aside is absent on both sides.
const READING_ELEMENTS = [
  { selector: '.method-step', checks: ['count'] },
  { selector: '.method-step__n', checks: ['box', 'font', 'text'] },
  { selector: '.method-step__lead', checks: ['box', 'font', 'text'] },
  { selector: '.method-step__targets', checks: ['count', 'box'] },
  { selector: '.target-chip__label', checks: ['box', 'font', 'text', 'type'] },
  { selector: '.target-chip__value', checks: ['box', 'font', 'text', 'type'] },
  { selector: '.method-step__purpose', checks: ['box', 'font', 'text', 'type'] },
  { selector: '.method-step__purpose-label', checks: ['box', 'font', 'text', 'type'] },
];

// The pen's closed steps and Show changes: step 1's tag, why label and type against fA1's (index 0 on
// both sides). The pen's acts and the child's struck tags are app-only and not compared by position.
const TYPOGRAPHY_ELEMENTS = [
  { selector: '.target-chip__label', checks: ['font', 'type', 'text'] },
  { selector: '.target-chip__value', checks: ['font', 'type', 'text'] },
  { selector: '.method-step__purpose-label', checks: ['font', 'type', 'text'] },
];

const METHOD_REGION = 'section.method-region';

const panel = (extra) => ({
  width: 1366,
  library: 'original',
  ready: '.method-region',
  anchor: METHOD_REGION,
  scope: METHOD_REGION,
  ...extra,
});

export default [
  {
    board: SAVE,
    panels: [
      panel({
        id: 'vC1',
        route: ROUTE,
        seed: ROOT_SEED,
        elements: READING_ELEMENTS,
        absent: ['.method-step__aside'],
      }),
    ],
  },
  {
    board: FIRST_VERSION,
    panels: [
      panel({
        id: 'fA1',
        route: ROUTE,
        seed: ROOT_SEED,
        elements: READING_ELEMENTS,
        absent: ['.method-step__aside'],
      }),
      panel({
        // The Next version pen opened on the seeded root: every step closed, drawn by StepPenBody's
        // closed form. The pen's acts are app-only and not compared by position.
        id: 'fA1',
        label: 'fA1-pen',
        route: ROUTE,
        seed: ROOT_SEED,
        steps: async (page) => {
          await page.getByRole('button', { name: 'Next version' }).first().click();
          await page.waitForSelector('form[aria-label="Next version"]');
        },
        elements: TYPOGRAPHY_ELEMENTS,
      }),
      panel({
        // A seeded child of the root, Show changes on: the child's step 2 changes one target and drops
        // another against the root.
        id: 'fA1',
        label: 'fA1-changes',
        route: '/notebook/vanilla/vanilla-v2',
        seed: showChangesSeed(),
        steps: async (page) => {
          await page.getByRole('button', { name: 'Show changes' }).first().click();
          await page.waitForSelector('.method-region .struck-value');
        },
        elements: TYPOGRAPHY_ELEMENTS,
      }),
    ],
  },
];
