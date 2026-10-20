// 10-05: the WebKit side-by-side spec for sketch 013's creation editor (creation-editor.html).
// Plan 10-05 draws the band, the headnote and Before you start (panels eA1 and eB1, both full
// pages at 1366: their board roots hold `.shell`, so they name no anchor); plans 10-07 and 10-10
// extend this spec with the table, the remove panels and the page heights.
//
//   S="${TMPDIR:-/tmp}/sprinkles-10"
//   npm --prefix app run build -- --outDir "$S/dist-05" --emptyOutDir
//   PROBE_DIST="$S/dist-05" node .planning/phases/10-the-creation-editor-without-save/10-board-check.mjs \
//     .planning/phases/10-the-creation-editor-without-save/10-board-editor.mjs
//
// If a comparison fails, read both DOM rects and computed styles first. A FAIL that traces to the
// build departing from the board is fixed in the build. A FAIL that traces to a fixture or engine
// difference is reported with both values and is never patched into app CSS; nothing is dropped
// from this spec and the tolerance stays 1 px.
const EDITOR = '.planning/sketches/013-creation-editor/creation-editor.html';

// The editor is drawn only once its reads settle (plan 10-02).
const READY = '.notebook.mk-page';

export default {
  board: EDITOR,
  panels: [
    // eA1, just arrived: a name and nothing else. The band, the headnote with no prose, Before
    // you start with Add note alone, and no Balance.
    {
      id: 'eA1',
      width: 1366,
      route: '/notebook/new',
      ready: READY,
      library: 'current',
      overflow: true,
      draft: { name: 'Vanilla' },
      elements: [
        { selector: '.notebook-recipe__form .ink-field', checks: ['box', 'font', 'color', 'border', 'value'] },
        { selector: '.notebook-recipe__form .prose-field', checks: ['box', 'font', 'color', 'border'] },
        { selector: '.notebook-ceremony > .notebook-caption', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.notebook-ceremony .ink-field', checks: ['box', 'font', 'color', 'border', 'value'] },
        { selector: '.notebook-ceremony .field-requirement', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.notebook-ceremony__actions button', checks: ['count', 'box', 'font', 'color', 'border', 'text'] },
        { selector: '.headnote h1', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.before-region .region-name', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.before-region .mk-add', checks: ['box', 'font', 'color', 'text'] },
      ],
      absent: ['.headnote__prose', '.side-region', '.method-region'],
    },
    // eB1, worked on: a description and two Before you start notes. Everything compared sits above
    // the Ingredients table, so the rows, the picker and the log column (plans 10-06 to 10-09) do
    // not move it; plan 10-07 gives this draft the board's five rows.
    {
      id: 'eB1',
      width: 1366,
      route: '/notebook/new',
      ready: READY,
      library: 'current',
      overflow: true,
      draft: {
        name: 'Vanilla',
        description: 'Plain and cold.',
        beforeYouStart: [{ text: 'Chill the mix overnight before churning.' }, { text: 'Keep the cream cold until it goes in.' }],
      },
      elements: [
        { selector: '.headnote h1', checks: ['box', 'text'] },
        { selector: '.headnote__prose', checks: ['box', 'font', 'color', 'text'] },
        { selector: '.authored__notes textarea', checks: ['count', 'box', 'font', 'color', 'border', 'value'] },
        { selector: '.authored__note-field .text-control', checks: ['count', 'box', 'font', 'color', 'text'] },
        { selector: '.before-region .mk-add', checks: ['box'] },
      ],
    },
  ],
};
