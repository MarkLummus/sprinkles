// 12-07: the Phase 12 board engine's own proof (12-board-check.mjs), on sketch 015's boards, with
// no build and no route. Every stand-in is held against a board panel or refused before any route,
// so the proof reads nothing of the app (run it with PROBE_DIST at an empty scratch folder).
//   - read-self-1366: the reading panel of the first record held against itself (the same board
//     file, the same selector and index). The against side reads from its own Page, so under
//     --selftest the 1 px run shrinks that side alone and the comparison fails as it must:
//     "PASS selftest read-self-1366".
//   - pen-count: Coffee's pen panel held against Mint chip's (six scales against five), refused
//     for 'count'.
//   - pen-missing: a pen panel index past the last of the three matches, refused for 'anchor'
//     (processPanel's not-found check, before any route).
//   - pen-undeclared: an elements selector the board does not draw (a third anchors span on Coffee
//     flavour's two-span line), refused for 'undeclared', the kind the engine records for an
//     elements selector with no board match.
//   - read-blind: a panel of text checks only, refused for 'selftest-blind' (the 1 px run cannot
//     move a text check).
//   - pen-attr: the attr check on the declared stops' aria-label, Coffee's first stop ('1: thin')
//     held against Mint chip's ('1: faint'), refused for 'value'.
// The appStyle option needs a built app and is not exercised here; 12-04's log panels exercise it.
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   mkdir -p "$S/no-build-07"
//   PROBE_DIST="$S/no-build-07" node .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs \
//     .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-selftest.mjs --selftest --evidence "$S/evidence-07"
//
// If a stand-in does not behave as written, read both sides' DOM before changing anything: a
// stand-in that names the wrong element is fixed here; an engine stage that still does not take the
// panel reference is fixed in 12-board-check.mjs; the 1 px tolerance never changes.

const SKETCH = '.planning/sketches/015-own-scales-and-problems';
const READING = `${SKETCH}/reading.html`;
const PEN = `${SKETCH}/record-pen.html`;

// The three panels of each board, in the order Coffee, Mint chip, Mexican Chocolate.
const WIN_1366 = '.fp-win.p12w-1366';

// The board suffixes each radio group's name with its panel ('axis-coffee-pen-two-1366', where the
// app writes 'axis-coffee'), so the stand-in matches the name by prefix.
const COFFEE_THIRD_ANCHOR = '.axis-mark:has(input[name^="axis-coffee"]) .axis-mark__anchors span:nth-child(3)';

export default [
  {
    board: READING,
    panels: [
      {
        // The reading panel held against itself: every check passes, and the 1 px run changes the
        // against side's Page alone.
        id: 'read-self',
        label: 'read-self-1366',
        width: 1366,
        panelSelector: WIN_1366,
        panelIndex: 0,
        against: { board: READING, panelSelector: WIN_1366, panelIndex: 0 },
        anchor: '.tasting-reading',
        elements: [
          { selector: '.batch-row__cell', checks: ['count', 'box'] },
          { selector: '.batch-row__cell-value', checks: ['text'] },
        ],
      },
      {
        // Text checks only: the 1 px font run cannot move one, so the engine refuses the panel
        // under --selftest.
        id: 'read-blind',
        label: 'read-blind-1366',
        width: 1366,
        panelSelector: WIN_1366,
        panelIndex: 0,
        against: { board: READING, panelSelector: WIN_1366, panelIndex: 0 },
        anchor: '.tasting-reading',
        elements: [
          { selector: '.batch-row__cell-label', checks: ['text'] },
          { selector: '.batch-row__cell-value', checks: ['text'] },
        ],
        refuses: 'selftest-blind',
      },
    ],
  },
  {
    board: PEN,
    panels: [
      {
        // Coffee's pen draws six scales, Mint chip's five.
        id: 'pen-count',
        label: 'pen-count-1366',
        width: 1366,
        panelSelector: WIN_1366,
        panelIndex: 0,
        against: { board: PEN, panelSelector: WIN_1366, panelIndex: 1 },
        anchor: '.axes-grid',
        elements: [{ selector: '.axis-mark', checks: ['count'] }],
        refuses: 'count',
      },
      {
        // The board holds three .fp-win.p12w-1366 panels; index 3 is past the last.
        id: 'pen-missing',
        label: 'pen-missing-1366',
        width: 1366,
        panelSelector: WIN_1366,
        panelIndex: 3,
        against: { board: PEN, panelSelector: WIN_1366, panelIndex: 0 },
        anchor: '.axes-grid',
        elements: [{ selector: '.axis-mark', checks: ['count'] }],
        refuses: 'anchor',
      },
      {
        // A Low to high scale's anchors line has two spans; the board draws no third.
        id: 'pen-undeclared',
        label: 'pen-undeclared-1366',
        width: 1366,
        panelSelector: WIN_1366,
        panelIndex: 0,
        against: { board: PEN, panelSelector: WIN_1366, panelIndex: 0 },
        anchor: '.axes-grid',
        elements: [{ selector: COFFEE_THIRD_ANCHOR, checks: ['count'] }],
        refuses: 'undeclared',
      },
      {
        // Coffee's first declared stop is Body's '1: thin', Mint chip's is '1: faint'.
        id: 'pen-attr',
        label: 'pen-attr-1366',
        width: 1366,
        panelSelector: WIN_1366,
        panelIndex: 0,
        against: { board: PEN, panelSelector: WIN_1366, panelIndex: 1 },
        anchor: '.axes-grid',
        elements: [{ selector: '.axis-mark--declared .axis-mark__stop input', checks: [{ attr: 'aria-label' }] }],
        refuses: 'value',
      },
    ],
  },
];
