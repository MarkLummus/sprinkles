// 11-01: the board engine's own proof (11-board-check.mjs), on sketch 014's save and
// first-version boards. It shows the engine can do what the later Phase 11 board specs need:
//   - a seeded page: vC1 (the saved recipe's reading page) passes its text and font checks
//     against a Vanilla recipe and version the engine writes to the store; the same panel with
//     no seed is refused for 'missing';
//   - a blind self-test refused: a copy of vC1 that holds only text checks cannot be moved by
//     the 1 px font run, so under --selftest it is refused for 'selftest-blind';
//   - an anchored full page: fA1 is held against vC1 at `.notebook-version` (full pages on both
//     sides, boxes measured from the anchor), and pictured under --evidence by that scope;
//   - a contradicted absence: fC1 draws the acts row without Edit, fA1 draws it, so the absent
//     Edit link is refused for 'present'.
//
//   S="${TMPDIR:-/tmp}/sprinkles-11"
//   npm --prefix app run build -- --outDir "$S/dist-01" --emptyOutDir
//   PROBE_DIST="$S/dist-01" node .planning/phases/11-steps-structure-save-and-print/11-board-check.mjs \
//     .planning/phases/11-steps-structure-save-and-print/11-board-selftest.mjs --selftest --evidence "$S/evidence-01"
//
// If a stand-in pair does not match, read both DOM rects first: a genuine difference between two
// approved panels is reported with both values and the element is dropped from this self-test
// with its reason in a comment; the tolerance stays 1 px.
import { library } from '../../../app/src/data/library.js';
import { createRecipe } from '../../../app/src/domain/newRecipe.js';
import { rowFromLibraryRecord } from '../../../app/src/domain/versionRow.js';

const SAVE = '.planning/sketches/014-steps-structure-save/save.html';
const FIRST_VERSION = '.planning/sketches/014-steps-structure-save/first-version.html';

// The engine's fixed ISO (11-board-check.mjs FIXED_ISO).
const NOW = '2026-10-20T12:00:00.000Z';

// The five rows vC1 draws, in order: library ids from app/src/data/library.js, grams, step 1.
const ROWS = [
  ['r1', 'wholeMilk', 600],
  ['r2', 'skimMilkPowder', 30],
  ['r3', 'sucrose', 150],
  ['r4', 'heavyCream', 250],
  ['r5', 'vanillaExtract', 5],
].map(([id, libraryId, grams]) => rowFromLibraryRecord({ id: libraryId, entry: library[libraryId] }, { id, grams, step: 1 }));

const { version } = createRecipe({ name: 'Vanilla', versionLabel: 'Version 1', rows: ROWS }, { recipeId: 'vanilla', versionId: 'vanilla-v1', now: NOW });
version.sheetDescription = 'Plain and cold.';

const SEED = {
  recipes: [{ id: 'vanilla', name: 'Vanilla', description: 'Plain and cold.' }],
  versions: [version],
};

const ROUTE = '/notebook/vanilla/vanilla-v1';

// vC1-seeded compares the identity line: its seeded Version name is "Version 1", which the build
// prints once (decide-p11-default-version-name-repeats, Mark 2026-10-27), so it reads the board's
// "Version 1 · Latest".
const SEEDED_ELEMENTS = [
  { selector: '.notebook-recipe__name', checks: ['text', 'font'] },
  { selector: '.notebook-version__identity', checks: ['text'] },
  { selector: '.version-row__reason', checks: ['text'] },
  // The font checks give the 1 px run something to move.
  { selector: '.notebook-version__acts .notebook-action', checks: ['text', 'font'] },
];

export default [
  {
    board: SAVE,
    panels: [
      {
        id: 'vC1',
        label: 'vC1-seeded',
        width: 1366,
        route: ROUTE,
        library: 'original',
        ready: '.notebook-version__identity',
        seed: SEED,
        elements: SEEDED_ELEMENTS,
      },
      {
        // The same panel with nothing written to the store: the route finds no recipe, and the
        // board's version line is missing in the app.
        id: 'vC1',
        label: 'vC1-unseeded',
        width: 1366,
        route: ROUTE,
        library: 'original',
        ready: '.shell',
        elements: [{ selector: '.notebook-version__identity', checks: ['text'] }],
        refuses: 'missing',
      },
      {
        // Text checks only: the 1 px font run cannot move one, so the engine refuses the panel
        // under --selftest.
        id: 'vC1',
        label: 'vC1-blind',
        width: 1366,
        route: ROUTE,
        library: 'original',
        ready: '.notebook-version__identity',
        seed: SEED,
        elements: [
          { selector: '.notebook-recipe__name', checks: ['text'] },
          { selector: '.version-row__reason', checks: ['text'] },
        ],
        refuses: 'selftest-blind',
      },
    ],
  },
  {
    board: FIRST_VERSION,
    panels: [
      {
        // Two full pages, held at the version section: fA1 against vC1.
        id: 'fA1',
        against: { board: SAVE, id: 'vC1' },
        label: 'fA1~vC1',
        width: 1366,
        anchor: '.notebook-version',
        elements: [
          { selector: '.notebook-version__acts .notebook-action', checks: ['box', 'font', 'text'] },
          { selector: '.notebook-version__acts .notebook-link', checks: ['count', 'box', 'text'] },
        ],
      },
      {
        // fC1 draws the acts row without Edit; fA1 draws it. The absence is contradicted.
        id: 'fC1',
        against: { board: FIRST_VERSION, id: 'fA1' },
        label: 'fC1~fA1',
        width: 1366,
        anchor: '.notebook-version',
        elements: [{ selector: '.notebook-version__acts .notebook-action', checks: ['box'] }],
        absent: ['.notebook-version__acts .notebook-link'],
        refuses: 'present',
      },
    ],
  },
];
