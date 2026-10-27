// 11-09: the WebKit side-by-side spec for Save (sketch 014 save.html, CONTRACT section 4). Full-page
// panels at 1366 with a coarse pointer:
//   vA1  ready to save: the ceremony "New recipe · draft" with Version name, then Cancel and the
//        filled Save on one row;
//   vB1  (11-11) Save refused: "Enter a recipe name." under the empty Recipe name, Required under the
//        empty Version name, the rest of the editor as vA1;
//   vC1  the page Save lands on: the notice card "Recipe saved.", the seeded-root reading of the
//        new version (Version 1 · Latest, "no reason recorded", Next version, one History node).
//
//   S="${TMPDIR:-/tmp}/sprinkles-11"
//   npm --prefix app run build -- --outDir "$S/dist-09" --emptyOutDir
//   PROBE_DIST="$S/dist-09" node .planning/phases/11-steps-structure-save-and-print/11-board-check.mjs \
//     .planning/phases/11-steps-structure-save-and-print/11-board-save.mjs --selftest --evidence "$S/evidence-09"
//
// If a comparison fails, read both DOM rects and computed styles first. A FAIL that traces to the
// build departing from the board is fixed in notebook.css or the one component that draws the
// element, to the board's own value. A FAIL that traces to a fixture or engine difference is
// reported with both values and is never patched into app CSS; the tolerance stays 1 px and
// nothing is dropped from this spec.
const BOARD = '.planning/sketches/014-steps-structure-save/save.html';

// The editor is drawn only once its reads settle (plan 10-02).
const READY = '.notebook.mk-page';

// The board's five rows (library ids from app/src/data/library.js), in the order vA1's table reads
// them: Whole milk, Skim milk powder and Sucrose in step 1, Heavy cream and Vanilla extract in
// step 2. A row a step uses holds one portion at that step's key.
const ROWS = [
  ['r1', 'wholeMilk', '600', 1],
  ['r2', 'skimMilkPowder', '30', 1],
  ['r3', 'sucrose', '150', 1],
  ['r4', 'heavyCream', '250', 2],
  ['r5', 'vanillaExtract', '5', 2],
].map(([id, libraryId, grams, step]) => ({ id, libraryId, portions: [{ step, grams }] }));

// vA1's draft, read from the board's own markup: two steps (the first with a target and a
// purpose), two Before you start notes, Philadelphia's four bands and -14, one scale and one problem.
const READY_TO_SAVE_DRAFT = {
  name: 'Vanilla',
  description: 'Plain and cold.',
  versionLabel: 'Version 1',
  beforeYouStart: [{ text: 'Chill the mix overnight before churning.' }, { text: 'Keep the cream cold until it goes in.' }],
  rows: ROWS,
  style: 'philadelphia',
  targets: { pod: ['14', '18'], fat: ['10', '18'], msnf: ['8', '12'], solids: ['36', '42'] },
  serveTempC: '-14',
  scales: [{ key: 'scale-creaminess', name: 'Creaminess', low: 'thin', high: 'rich', kind: 'goldilocks', group: 'declared' }],
  problems: ['Bitter'],
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
  ],
};

const panel = (extra) => ({
  width: 1366,
  route: '/notebook/new',
  ready: READY,
  library: 'original',
  draft: READY_TO_SAVE_DRAFT,
  ...extra,
});

export default {
  board: BOARD,
  panels: [
    panel({
      id: 'vA1',
      elements: [
        { selector: 'form.notebook-ceremony', checks: ['box'] },
        { selector: '.notebook-ceremony .notebook-caption', checks: ['count', 'text'] },
        { selector: '.notebook-ceremony__actions button', checks: ['count', 'box', 'font', 'color', 'text'] },
      ],
    }),
    panel({
      // vB1 (plan 11-11): the board's draft with the name and the Version name emptied, and Save
      // pressed. The board draws the Version name's Required as the always-on guidance and the
      // build draws it as the refusal's error in the same place, so the ceremony's two kinds of
      // line are compared together (count, box, text) rather than by class.
      id: 'vB1',
      draft: { ...READY_TO_SAVE_DRAFT, name: '', versionLabel: '' },
      steps: async (page) => {
        await page.click('.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)');
        await page.waitForSelector('.notebook-recipe .field-error');
      },
      elements: [
        { selector: '.notebook-recipe .field-error', checks: ['count', 'box', 'font', 'color', 'text'] },
        { selector: '.notebook-ceremony .field-error, .notebook-ceremony .field-requirement', checks: ['count', 'box', 'text'] },
        { selector: '.notebook-ceremony__actions button', checks: ['count', 'box', 'text'] },
      ],
    }),
    panel({
      // Save pressed on vA1's draft: the page lands on the new version with the notice still
      // showing. The board anchors the card in its window and the app fixes it to the viewport, so
      // the card is compared by size, face and colour, not by position. Left out here, each with
      // its reason:
      //   - Edit (`.notebook-version__acts .notebook-link`) is plan 11-12's;
      //   - the board's table draws a Step 3 head with no row beneath it, which the build does not
      //     draw for a step that uses nothing (CONTRACT section 2);
      //   - `.notebook-version__identity` [text]: the board reads "Version 1 · Latest" and the
      //     build's identity line is `Version ${n} · ${versionLabel}` plus " · Latest"
      //     (lineage.js versionIdentity), so the new recipe's default Version name "Version 1"
      //     reads "Version 1 · Version 1 · Latest"; no stored label can read the board's words
      //     (plan 11-01 found the same). Only the "Latest" tail, which both draw, is compared;
      //   - `.notebook-history .fold-row__count` [text]: the board draws History as a fold with one
      //     node and "1 version", where the build's established rule (RecipeHistory.jsx, 03.5-18)
      //     reads a lone saved version as one plain line, "Only this version so far", with no fold
      //     and no count. Only the History caption, which both draw, is compared.
      // Both differences are reported to Mark and Sid in the summary; neither is patched into app
      // code from here.
      id: 'vC1',
      steps: async (page) => {
        await page.click('.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)');
        await page.waitForFunction(() => document.querySelector('.page-status')?.textContent.trim() === 'Recipe saved.');
        await page.waitForSelector('.notebook-version__identity');
      },
      elements: [
        { selector: '.page-status', checks: ['size', 'font', 'color', 'text'] },
        { selector: '.notebook-version__latest', checks: ['text'] },
        { selector: '.version-row__reason', checks: ['text'] },
        { selector: '.notebook-version__acts .notebook-action', checks: ['size', 'text'] },
        { selector: '.notebook-history .notebook-caption', checks: ['count', 'text'] },
      ],
    }),
  ],
};
