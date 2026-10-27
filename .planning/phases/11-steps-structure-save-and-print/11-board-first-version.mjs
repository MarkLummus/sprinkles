// 11-10: the WebKit side-by-side spec for the first version's editing ceremony (sketch 014
// first-version.html, CONTRACT section 5). One full-page panel at 1366:
//   fB1  the creation editor opened on the saved Vanilla root at its edit address: the band's
//        Recipe name and description, the ceremony "Version 1 · editing" with Version name
//        'Version 1', then Cancel and the filled Save on one row.
// Plan 11-12 adds fA1 (the Edit link on the page) and fC1 to this file.
//
//   S="${TMPDIR:-/tmp}/sprinkles-11"
//   npm --prefix app run build -- --outDir "$S/dist-10" --emptyOutDir
//   PROBE_DIST="$S/dist-10" node .planning/phases/11-steps-structure-save-and-print/11-board-check.mjs \
//     .planning/phases/11-steps-structure-save-and-print/11-board-first-version.mjs --selftest
//
// If a comparison fails, read both DOM rects and computed styles first. A FAIL that traces to the
// build departing from the board is fixed in notebook.css or the one component that draws the
// element, to the board's own value. A FAIL that traces to a fixture or engine difference is
// reported with both values and is never patched into app CSS; the tolerance stays 1 px and
// nothing is dropped from this spec.
import { library } from '../../../app/src/data/library.js';
import { createRecipe } from '../../../app/src/domain/newRecipe.js';
import { rowFromLibraryRecord } from '../../../app/src/domain/versionRow.js';

const BOARD = '.planning/sketches/014-steps-structure-save/first-version.html';

// The engine's fixed ISO (11-board-check.mjs FIXED_ISO).
const NOW = '2026-10-20T12:00:00.000Z';

// The editor is drawn only once its reads settle (plan 10-02).
const READY = '.notebook.mk-page';

// The saved Vanilla root the board's fB1 edits, built as 11-board-reading.mjs builds it: five rows
// (Whole milk, Skim milk powder and Sucrose in step 1, Heavy cream and Vanilla extract in step 2),
// two Before you start notes, and the two steps fB1 draws. 11-board-reading.mjs's root carries a
// third step, Churn, for the reading page's board (vC1, fA1); fB1 draws only the first two, so the
// editor's step count (.method-step__n, the lead-in fields) is held to two here: a fixture
// difference, settled in this spec and not in the app.
const ROWS = [
  ['r1', 'wholeMilk', 600, 1],
  ['r2', 'skimMilkPowder', 30, 1],
  ['r3', 'sucrose', 150, 1],
  ['r4', 'heavyCream', 250, 2],
  ['r5', 'vanillaExtract', 5, 2],
].map(([id, libraryId, grams, step]) =>
  rowFromLibraryRecord({ id: libraryId, entry: library[libraryId] }, { id, grams, step }),
);

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
];

const BEFORE_YOU_START = [
  { text: 'Chill the mix overnight before churning.', inheritedFrom: null },
  { text: 'Keep the cream cold until it goes in.', inheritedFrom: null },
];

function seededRoot() {
  const { version } = createRecipe(
    {
      name: 'Vanilla',
      versionLabel: 'Version 1',
      rows: ROWS,
      description: 'Plain and cold.',
      method: METHOD,
      authored: { beforeYouStart: BEFORE_YOU_START },
    },
    { recipeId: 'vanilla', versionId: 'vanilla-v1', now: NOW },
  );
  return version;
}

const ROOT_SEED = {
  recipes: [{ id: 'vanilla', name: 'Vanilla', description: 'Plain and cold.' }],
  versions: [seededRoot()],
};

export default {
  board: BOARD,
  panels: [
    {
      // The editor on the saved root: the ceremony form, its caption pair, Cancel then Save, the
      // band's two fields and the steps' numbers and lead-ins.
      id: 'fB1',
      width: 1366,
      route: '/notebook/vanilla/vanilla-v1/edit',
      ready: READY,
      library: 'original',
      seed: ROOT_SEED,
      elements: [
        { selector: 'form.notebook-ceremony', checks: ['box'] },
        { selector: '.notebook-ceremony .notebook-caption', checks: ['count', 'text'] },
        { selector: '.notebook-ceremony__actions button', checks: ['count', 'box', 'font', 'color', 'text'] },
        { selector: '.notebook-recipe__form .ink-field', checks: ['box', 'value'] },
        { selector: '.notebook-recipe__form textarea', checks: ['box', 'value'] },
        { selector: '.method-step__n', checks: ['count', 'text'] },
        { selector: '.prose-field--lead-in', checks: ['count', 'value'] },
      ],
    },
  ],
};
