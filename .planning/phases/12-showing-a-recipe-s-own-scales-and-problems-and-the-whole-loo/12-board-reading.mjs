// 12-04: the reading of sketch 015 (reading.html) held against the build, panel by panel, on
// 12-07's engine (12-board-check.mjs, used as it stands). Board against build in Playwright WebKit
// with a coarse pointer at 1 px, never prose or a test count (D-14). CONTRACT section 2 is what the
// panels hold:
//   - the Tasting fold lists only what was marked or ticked, under the build's own group labels
//     (Every recipe, This recipe only, Any problems? with its own This recipe only); a recipe with
//     nothing of its own stored shows only Every recipe;
//   - a marked Low to high scale says back 'faint (1)', '2 of 5', '3 of 5', '4 of 5', 'strong (5)'
//     (Coffee flavour marked 2 reads '2 of 5'; Mint marked 5 reads 'strong (5)');
//   - a Right in the middle scale reads as built: 'more (4)', 'heavy (4)', 'right (3)';
//   - cell boxes are the build's; only the value's text changes.
// The board's panels are the built app's markup, so each case is the app with 12-cases.mjs's
// example recipe injected into its own throwaway IndexedDB, then the seeded batch's Tasting fold
// opened when it is closed (.planning/canvas-generators/p12-capture.mjs, the reading step).
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   PROBE_DIST="$S/dist-04" node .planning/phases/12-*/12-board-check.mjs \
//     .planning/phases/12-*/12-board-reading.mjs --selftest --evidence "$S/evidence-04"
import { CASES, arrive } from './12-cases.mjs';

const BOARD = '.planning/sketches/015-own-scales-and-problems/reading.html';

// The panels of reading.html in the order Coffee, Mint chip, Mexican Chocolate, at 1366 (the 350
// column) and at 393.
const WIN = { 1366: '.fp-win.p12w-1366', 393: '.fp-win.p12w-393' };

// The case injected (12-cases.mjs's inject, through arrive), the route loaded again, then the
// seeded batch's Tasting fold opened when it is closed.
const readingSteps = (caseKey) => async (page) => {
  await arrive(page, new URL(page.url()).origin, caseKey);
  const fold = page.locator('.notebook-log [aria-expanded="false"]').filter({ hasText: /^Tasting/ }).first();
  if (await fold.count()) {
    await fold.click();
    await page.waitForTimeout(300);
  }
  await page.waitForSelector('.tasting-reading');
};

const readingElements = (hasProblems) => [
  { selector: '.batch-row__group-label', checks: ['count', 'text'] },
  { selector: '.tasting-reading__group', checks: ['count'] },
  { selector: '.batch-row__cell', checks: ['count', 'box'] },
  { selector: '.batch-row__cell-label', checks: ['text'] },
  { selector: '.batch-row__cell-value', checks: ['text'] },
  ...(hasProblems ? [{ selector: '.tasting-reading__problems', checks: ['text', 'font', 'color'] }] : []),
];

function readingPanel({ caseKey, recipe, width, index }) {
  const c = CASES[caseKey];
  const none = !c.axes;
  const panel = {
    id: `reading-${caseKey}-${width}`,
    label: `reading-${recipe}-${width}`,
    width,
    panelSelector: WIN[width],
    panelIndex: index,
    route: c.route,
    library: 'current',
    ready: '.notebook-log',
    steps: readingSteps(caseKey),
    anchor: '.tasting-reading',
    elements: readingElements(!none),
  };
  if (none) {
    // A recipe with nothing of its own stored shows only "Every recipe": no second group (the
    // scales' "This recipe only" and Any problems?), no problems subgroup and no problems line,
    // on either side.
    panel.absent = ['.tasting-reading__group ~ .tasting-reading__group', '.tasting-reading__subgroup', '.tasting-reading__problems'];
  }
  if (width === 393) panel.overflow = true;
  return panel;
}

export default {
  board: BOARD,
  panels: [
    readingPanel({ caseKey: 'two', recipe: 'coffee', width: 1366, index: 0 }),
    readingPanel({ caseKey: 'one', recipe: 'mint-chip', width: 1366, index: 1 }),
    readingPanel({ caseKey: 'none', recipe: 'mexican-chocolate', width: 1366, index: 2 }),
    readingPanel({ caseKey: 'two', recipe: 'coffee', width: 393, index: 0 }),
    readingPanel({ caseKey: 'one', recipe: 'mint-chip', width: 393, index: 1 }),
    readingPanel({ caseKey: 'none', recipe: 'mexican-chocolate', width: 393, index: 2 }),
  ],
};
