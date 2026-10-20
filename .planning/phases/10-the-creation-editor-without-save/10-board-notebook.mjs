// 10-03: the Notebook's New recipe entry and kept draft held to sketch 013's
// notebook-new-recipe.html, side by side in Playwright WebKit with a coarse pointer, at 1366 and 393.
//
//   S="${TMPDIR:-/tmp}/sprinkles-10"
//   npm --prefix app run build -- --outDir "$S/dist-03" --emptyOutDir
//   PROBE_DIST="$S/dist-03" node .planning/phases/10-the-creation-editor-without-save/10-board-check.mjs \
//     .planning/phases/10-the-creation-editor-without-save/10-board-notebook.mjs
//
// Every panel of this board is a full page (its board root holds the shell, p10.py's nb_panel draws
// the built shell), so no panel names an anchor: boxes compare from the page origin and the document.
// The board's last panel, the one titled "Option B · several drafts", is the rejected option (decision 10) and
// is not a target. A FAIL is read from both DOM rects first: a build that departs from the board is
// fixed to the board's own rule or markup; a fixture or engine difference is reported with both
// values and never patched into app CSS; the tolerance stays 1 px.
const BOARD = '.planning/sketches/013-creation-editor/notebook-new-recipe.html';

const openEntry = (page) => page.click('.nb__head .notebook-action');
const typePineapple = async (page) => {
  await openEntry(page);
  await page.fill('.nb__new input', 'Pineapple');
};
const pressStartBlank = async (page) => {
  await openEntry(page);
  await page.click('.nb__new-actions .notebook-action');
  await page.waitForSelector('.nb__new .field-error');
};

const panel = (id, width, rest) => ({
  id,
  width,
  route: '/notebook',
  // Drawn once the place's reads resolve, the draft row with them.
  ready: '.nb__count',
  library: 'current',
  visitLinks: '.nb__name a',
  overflow: true,
  ...rest,
});

const titleRow = [
  { selector: '.nb__head', checks: ['box'] },
  { selector: '.place__title', checks: ['box', 'font', 'color', 'text'] },
  { selector: '.nb__head .notebook-action', checks: ['box', 'font', 'color', 'border', 'text'] },
  { selector: '.nb__count', checks: ['box', 'text'] },
  { selector: '.nb__row', checks: ['count', 'box'] },
];

const entry = [
  { selector: '.nb__new', checks: ['box'] },
  { selector: '.nb__new .notebook-caption', checks: ['box', 'font', 'color', 'text'] },
  { selector: '.nb__new .ink-field', checks: ['box', 'font', 'color', 'border'] },
  { selector: '.nb__new-actions button', checks: ['count', 'box', 'font', 'color', 'border', 'text'] },
  { selector: '.nb__count', checks: ['box'] },
];

const typed = [
  { selector: '.nb__new .field-error', checks: ['box', 'font', 'color', 'text'] },
  { selector: '.nb__new .ink-field', checks: ['value'] },
];

const required = [{ selector: '.nb__new .field-error', checks: ['box', 'font', 'color', 'text'] }];

const kept = [
  { selector: '.nb__drafts', checks: ['box'] },
  { selector: '.nb__draft', checks: ['box'] },
  { selector: '.nb__draft .nb__name', checks: ['box', 'font', 'color', 'text'] },
  { selector: '.nb__draft .nb__meta', checks: ['box', 'font', 'color', 'text'] },
  { selector: '.nb__draft-act button', checks: ['box', 'font', 'color', 'border', 'text'] },
  { selector: '.nb__count', checks: ['box', 'text'] },
];

export default {
  board: BOARD,
  panels: [
    panel('nA1', 1366, { extraWidths: [744, 768, 1024], elements: titleRow }),
    panel('nA2', 393, { elements: titleRow }),
    panel('nB1', 1366, { steps: openEntry, elements: entry, absent: ['.nb__head .notebook-action'] }),
    panel('nB2', 393, { steps: openEntry, elements: entry, absent: ['.nb__head .notebook-action'] }),
    panel('nC1', 1366, { steps: typePineapple, elements: typed }),
    panel('nC2', 393, { steps: typePineapple, elements: typed }),
    panel('nD1', 1366, { steps: pressStartBlank, elements: required }),
    panel('nE1', 1366, { draft: { name: 'Vanilla' }, elements: kept, absent: ['.nb__head .notebook-action'] }),
    panel('nD2', 393, { draft: { name: 'Vanilla' }, elements: kept, absent: ['.nb__head .notebook-action'] }),
  ],
};
