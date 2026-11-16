// 12-04: the record pen of sketch 015 (record-pen.html) held against the build, panel by panel, on
// 12-07's engine (12-board-check.mjs, used as it stands). Conformance is board against build in
// Playwright WebKit with a coarse pointer at 1 px, never prose or a test count (D-14; sketch 015
// README, Authority). CONTRACT section 1 is what the panels hold:
//   - a recipe's own scales stand under "This recipe only", its own problems under their own
//     "This recipe only" inside Any problems?; a recipe that declares none draws neither cue;
//   - a Right in the middle scale (Body) keeps its three anchors; a Low to high scale (Coffee
//     flavour, Mint) draws two: the low word at 0 to 26.9 and the high word at 177.1 to 216 of the
//     216 track, no "right"; the stops' names are '1: faint', '2', '3', '4', '5: strong';
//   - the box of every scale stays 88 tall; the same at 393 with no sideways overflow.
// The board's panels are the built app's markup, so each case is the app with 12-cases.mjs's
// example recipe injected into its own throwaway IndexedDB; the steps then open the pen and make the
// marks and ticks the board shows (.planning/canvas-generators/p12-capture.mjs, the pen flow).
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   PROBE_DIST="$S/dist-04" node .planning/phases/12-*/12-board-check.mjs \
//     .planning/phases/12-*/12-board-pen.mjs --selftest --evidence "$S/evidence-04"
import { CASES, arrive } from './12-cases.mjs';

const BOARD = '.planning/sketches/015-own-scales-and-problems/record-pen.html';

// The panels of record-pen.html in the order Coffee, Mint chip, Mexican Chocolate, at 1366 (the 350
// column) and at 393.
const WIN = { 1366: '.fp-win.p12w-1366', 393: '.fp-win.p12w-393' };

// Opens the pen as the board shows it: the case injected (12-cases.mjs's inject, through arrive),
// the route loaded again, Record another (or Record a batch) and Add tasting, then the case's marks
// and ticks.
const penSteps = (caseKey) => async (page) => {
  const c = await arrive(page, new URL(page.url()).origin, caseKey);
  const log = page.locator('.notebook-log');
  await log.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click();
  await page.waitForTimeout(400);
  await log.getByRole('button', { name: /add tasting/i }).first().click();
  await page.waitForSelector('.notebook-log .axis-mark');
  await page.waitForTimeout(400);
  for (const [name, stop] of c.pen) {
    await log
      .locator('.axis-mark', { has: page.locator('.axis-mark__name', { hasText: new RegExp(`^${name}$`) }) })
      .locator('.axis-mark__stop')
      .nth(stop - 1)
      .click();
  }
  for (const tick of c.ticks ?? []) await log.locator('.chip-toggle', { hasText: new RegExp(`^${tick}$`) }).click();
  await page.waitForTimeout(350);
};

// A scale's box, the anchors line's spans (a Low to high scale has two, at the ends of the 216
// track), each stop's box, every radio's aria-label, the cues and the chips: board equal to build.
const penElements = (marked) => [
  { selector: '.axis-mark', checks: ['count', 'box'] },
  { selector: '.axis-mark__name', checks: ['text', 'font'] },
  ...(marked ? [{ selector: '.axis-mark__state', checks: ['count', 'text'] }] : []),
  { selector: '.axis-mark__anchors span', checks: ['count', 'text', 'box'] },
  { selector: '.axis-mark__stop', checks: ['count', 'box'] },
  { selector: '.axis-mark__stop input', checks: [{ attr: 'aria-label' }] },
  { selector: '.axes-cue, .defect-group .pen-caption', checks: ['count', 'text'] },
  { selector: '.chip-toggle', checks: ['count', 'text', 'box'] },
];

function penPanel({ caseKey, recipe, width, index }) {
  const c = CASES[caseKey];
  const none = !c.axes;
  const panel = {
    id: `pen-${caseKey}-${width}`,
    label: `pen-${recipe}-${width}`,
    width,
    panelSelector: WIN[width],
    panelIndex: index,
    route: c.route,
    library: 'current',
    ready: '.notebook-log',
    steps: penSteps(caseKey),
    anchor: '.axes-grid',
    elements: penElements(!none),
  };
  if (none) {
    // TASTE-04's empty edge: a recipe that declares none draws no "This recipe only" cue on the
    // scales or on the problems, so neither declared group exists on either side.
    panel.absent = ['.axes-grid__group--declared', '.defect-group--declared', '.axis-mark__state'];
  }
  if (width === 393) panel.overflow = true;
  return panel;
}

export default {
  board: BOARD,
  panels: [penPanel({ caseKey: 'two', recipe: 'coffee', width: 1366, index: 0 })],
};
