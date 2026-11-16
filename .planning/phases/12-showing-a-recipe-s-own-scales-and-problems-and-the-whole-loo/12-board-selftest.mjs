// 12-07: the Phase 12 board engine's own proof (12-board-check.mjs), on sketch 015's boards, with
// no build and no route. Every stand-in is held against a board panel or refused before any route,
// so the proof reads nothing of the app (run it with PROBE_DIST at an empty scratch folder).
//   - read-self-1366: the reading panel of record Coffee held against itself (the same board file,
//     the same selector and index). The against side reads from its own Page, so under --selftest
//     the 1 px run shrinks that side alone and the comparison fails as it must:
//     "PASS selftest read-self-1366".
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

// The three panels of each board, in the order Coffee, Mint chip, Mexican Chocolate.
const WIN_1366 = '.fp-win.p12w-1366';

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
    ],
  },
];
