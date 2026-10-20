// 10-01: the board engine's self-test of cropped panels. Every panel is a stand-in (it takes
// another board panel as its app side), so this needs no build: the engine is proven on a
// sheet-only (eC1, eC2) and two log-only (tB1, tA1, sB1) 013 panels, each set beside the
// full-page panel that draws the same region, with a declared absence and a frame among the
// positives and seven negative panels that the engine must refuse for what they are.
//
//   node .planning/phases/10-the-creation-editor-without-save/10-board-check.mjs \
//     .planning/phases/10-the-creation-editor-without-save/10-board-013-anchors.mjs --selftest
//
// These are the anchors the later specs name: `.notebook-body__sheet` for the Sheet crops
// (plans 10-07, 10-08's Balance panels, 10-10 and 10-12), `.mk-region[aria-label="Style"]` for
// the Style crops (10-08), and the Scales head `.mk-region[aria-label="Scales"] .batch-row__head`
// with scope `.notebook-log` and the Scales-to-Problems frame for the scales crops (10-09).
//
// Should a stand-in pair not match, read both DOM rects first: the 2026-10-20 probe found these
// pairs equal, so a FAIL here is an engine defect to fix in 10-board-check.mjs, never a reason
// to drop an element or widen the tolerance.
const DIR = '.planning/sketches/013-creation-editor';
const EDITOR = `${DIR}/creation-editor.html`;
const STYLE = `${DIR}/style-menu-and-bands.html`;
const SCALES = `${DIR}/scales-and-problems.html`;

const SHEET = '.notebook-body__sheet';
const STYLE_REGION = '.mk-region[aria-label="Style"]';
const SCALES_HEAD = '.mk-region[aria-label="Scales"] .batch-row__head';
const PROBLEMS = '.mk-region[aria-label="Problems"]';
const CLEAR = '.batch-row__head-acts .text-control';

export default [
  {
    board: EDITOR,
    panels: [
      // The Sheet crop beside the full page that draws it.
      {
        id: 'eC1',
        width: 1366,
        against: { board: EDITOR, id: 'eB1' },
        anchor: SHEET,
        scope: SHEET,
        pageHeight: true,
        elements: [
          { selector: '.headnote h1', checks: ['box', 'font', 'text'] },
          { selector: '.authored__notes textarea', checks: ['count', 'box', 'value'] },
          { selector: '.ingredient-table tbody tr', checks: ['count', 'box'] },
          { selector: '.ingredient-table__plan-grams .ink-field', checks: ['count', 'box', 'value'] },
          { selector: '.ingredient-table tfoot tr', checks: ['box', 'text'] },
        ],
      },
      // Negative: a cropped panel with no anchor is refused, never compared against the document.
      {
        id: 'eC1',
        label: 'eC1-unanchored',
        width: 1366,
        against: { board: EDITOR, id: 'eB1' },
        refuses: 'anchor',
        elements: [{ selector: '.ingredient-table tbody tr', checks: ['box'] }],
      },
      // Negative: four rows beside five.
      {
        id: 'eC2',
        width: 1366,
        against: { board: EDITOR, id: 'eB1' },
        anchor: SHEET,
        scope: SHEET,
        refuses: 'count',
        elements: [{ selector: '.ingredient-table tbody tr', checks: ['count'] }],
      },
      // Negative: the total row sits a row's height higher.
      {
        id: 'eC2',
        width: 1366,
        against: { board: EDITOR, id: 'eC1' },
        anchor: SHEET,
        scope: SHEET,
        refuses: 'box',
        elements: [{ selector: '.ingredient-table tfoot tr', checks: ['box'] }],
      },
      // Negative: two full pages; the arrival draws no Balance.
      {
        id: 'eB1',
        width: 1366,
        against: { board: EDITOR, id: 'eA1' },
        refuses: 'missing',
        elements: [{ selector: '.side-region', checks: ['box'] }],
      },
    ],
  },
  {
    board: STYLE,
    panels: [
      // The Style crop beside the full page that draws it.
      {
        id: 'tB1',
        width: 1366,
        against: { board: EDITOR, id: 'eB1' },
        anchor: STYLE_REGION,
        elements: [
          { selector: '.mk-menu', checks: ['box', 'font', 'value'] },
          { selector: '.mk-field-row .ink-field', checks: ['box', 'value'] },
          { selector: '.mk-band', checks: ['count', 'box'] },
          { selector: '.mk-band__ends .ink-field', checks: ['count', 'box', 'value'] },
        ],
      },
      // A declared absence passes: no style is picked on either, so neither draws Clear.
      {
        id: 'tA1',
        width: 1366,
        against: { board: EDITOR, id: 'eA1' },
        anchor: STYLE_REGION,
        elements: [
          { selector: '.mk-menu', checks: ['box', 'font', 'value'] },
          { selector: '.mk-field-row .ink-field', checks: ['box', 'value'] },
          { selector: '.mk-band__ends .ink-field', checks: ['count', 'box', 'value'] },
        ],
        absent: [CLEAR],
      },
      // Negative: the board draws no Clear, and the panel measures it instead of declaring it absent.
      {
        id: 'tA1',
        label: 'tA1-undeclared',
        width: 1366,
        against: { board: EDITOR, id: 'eA1' },
        anchor: STYLE_REGION,
        refuses: 'undeclared',
        elements: [{ selector: CLEAR, checks: ['count'] }],
      },
      // Negative: eB1 has Philadelphia picked and draws Clear, which contradicts the declared absence.
      {
        id: 'tA1',
        width: 1366,
        against: { board: EDITOR, id: 'eB1' },
        anchor: STYLE_REGION,
        refuses: 'present',
        elements: [{ selector: '.mk-menu', checks: ['box'] }],
        absent: [CLEAR],
      },
    ],
  },
  {
    board: SCALES,
    panels: [
      // The Scales-to-Problems band beside the full page: both 350 by 930 while the scopes differ.
      {
        id: 'sB1',
        width: 1366,
        against: { board: EDITOR, id: 'eB1' },
        anchor: SCALES_HEAD,
        scope: '.notebook-log',
        frame: { from: SCALES_HEAD, to: PROBLEMS },
        elements: [
          { selector: '.mk-card', checks: ['count', 'box'] },
          { selector: '.mk-card .ink-field', checks: ['count', 'box', 'value'] },
          { selector: '.segmented__option', checks: ['count', 'box'] },
          { selector: '.mk-stops', checks: ['count', 'text'] },
          { selector: '.mk-add', checks: ['count', 'box', 'text'] },
        ],
      },
      // Negative: eA1's band is 350 by 392.9, because the arrival draws no cards.
      {
        id: 'sB1',
        width: 1366,
        against: { board: EDITOR, id: 'eA1' },
        anchor: SCALES_HEAD,
        scope: '.notebook-log',
        frame: { from: SCALES_HEAD, to: PROBLEMS },
        refuses: 'frame',
        elements: [{ selector: '.mk-add', checks: ['count'] }],
      },
    ],
  },
];
