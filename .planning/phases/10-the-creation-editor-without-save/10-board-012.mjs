// 10-01: the board engine's own self-test over sketch 012's Notebook board. The app's /notebook
// place is unchanged by this plan and was built to match these panels in Phase 9, so every
// comparison here must pass: it proves the engine reads a matching page as a match.
//
//   PROBE_DIST=<dist> node .planning/phases/10-the-creation-editor-without-save/10-board-check.mjs \
//     .planning/phases/10-the-creation-editor-without-save/10-board-012.mjs --selftest
//
// If a comparison fails on the unchanged app, read both DOM rects before anything else (measure,
// then edit): a genuine drift between sketch 012 and the built place is reported in the plan's
// summary with both values, the element is dropped from this spec with its reason in a comment,
// and the tolerance is never widened.
const elements = [
  { selector: '.place__title', checks: ['box', 'font', 'color', 'text'] },
  { selector: '.nb__count', checks: ['box', 'font', 'color', 'text'] },
  { selector: '.nb__row', checks: ['count', 'box'] },
  { selector: '.nb__name a', checks: ['size', 'font', 'color', 'text'] },
  { selector: '.nb__meta', checks: ['font', 'color', 'text'] },
];

const panel = (id, width) => ({
  id,
  width,
  route: '/notebook',
  // The list is drawn only once the place's reads resolve.
  ready: '.nb__count',
  library: 'current',
  visitLinks: '.nb__name a',
  overflow: true,
  elements,
});

export default {
  board: '.planning/sketches/012-places/notebook-place.html',
  panels: [panel('pn1', 1366), panel('pn2', 393)],
};
