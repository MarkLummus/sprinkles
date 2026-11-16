// 12-04: the printed logs of sketch 015 (printed-logs.html) held against the build, page by page,
// on 12-07's engine (12-board-check.mjs, used as it stands). Board against build in Playwright
// WebKit with a coarse pointer at 1 px, never prose or a test count (D-14). CONTRACT section 3 is
// what the pages hold (D-01 amendment, D-15, D-17):
//   - both log pages start 1.5 in from the top of the paper: the content starts 144 px below the
//     picture's top (48 plus the 96 px drop), so .lf-title's top is measured from the page's top;
//   - the room comes out of the notes lines only: 13 on the Batch log, 4 on each Tasting log;
//   - every scale row is 36 px tall, the Low to high row included; a Low to high row has no
//     .lf-mid and no numbers but 1 and 5, so the count of .lf-mid on each page equals the board's;
//   - the foot reads the recipe, the version and the Sheet code, as built.
//
// printed-logs.html holds six letter pages (.dl-page, 816 x 1056). Indexes 0 and 1 are "As built
// today, for comparison" (the build's own Batch log and Tasting log before this phase); they are
// comparison, not targets, and are left out here on purpose. Indexes 2 to 5 are drawn: the Batch
// log, then the Tasting logs for two, one and none of the recipe's own scales and problems.
//
// The board's picture scale is 1 (p12.py:175, inline --sheet-print-picture-scale on
// .print-route__pages), and the app sets the same property inline from PrintSheet.jsx:159 to the
// measured scale, so appStyle below marks the board's value !important (an author rule beats an
// inline style only so) and every panel's pageHeight shows a scale other than 1 as a FAIL. This is
// appStyle's first use.
//
// The anchor is plain CSS that matches exactly one element on each side through querySelectorAll
// (engine lines 195-199, so :has() works and Playwright-only pseudo-classes do not): the app's
// .shell holds both log pages and the board's picture wrapper carries no aria-label, so neither a
// bare class nor the app's aria-label can tell the two pages apart. The Batch log is the
// .print-page--log without a scale row, the Tasting log the one with one.
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   PROBE_DIST="$S/dist-04" node .planning/phases/12-*/12-board-check.mjs \
//     .planning/phases/12-*/12-board-logs.mjs --selftest --evidence "$S/evidence-04"
import { CASES, arrive } from './12-cases.mjs';

const BOARD = '.planning/sketches/015-own-scales-and-problems/printed-logs.html';

const PAGE = '.dl-page';
const BATCH_ANCHOR = '.print-page--log:not(:has(.lf-srow))';
const TASTING_ANCHOR = '.print-page--log:has(.lf-srow)';
const SCALE_ONE = '.print-route__pages{--sheet-print-picture-scale:1 !important}';

// The case injected (12-cases.mjs's inject, through arrive: the version route, then the injection,
// then the route again), then the print route of the same version, ready when the engine has set
// its measured state.
const logSteps = (caseKey) => async (page) => {
  const c = await arrive(page, new URL(page.url()).origin, caseKey);
  await page.goto(`${new URL(page.url()).origin}${c.route}/print`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.print-route[data-print-ready="true"]', { timeout: 10000 });
  await page.evaluate(() => document.fonts.ready);
};

function logPanel({ caseKey, label, index, anchor, elements, absent, foot }) {
  const c = CASES[caseKey];
  const panel = {
    id: label,
    label,
    width: 1366,
    panelSelector: PAGE,
    panelIndex: index,
    route: `${c.route}/print`,
    library: 'current',
    ready: '.print-route[data-print-ready="true"]',
    steps: logSteps(caseKey),
    appStyle: SCALE_ONE,
    pageHeight: true,
    anchor,
    elements: [...elements, foot],
  };
  if (absent) panel.absent = absent;
  return panel;
}

// The Batch log draws no scale row, so its spec declares the scale-row selectors absent instead of
// measuring them: each is zero on both sides and prints its own PASS line.
const BATCH_ELEMENTS = [
  { selector: '.lf-datebox', checks: ['box'] }, // the first thing on the page: its top is 144 px below the picture's top
  { selector: '.lf-title', checks: ['box'] },
  { selector: '.lf-line', checks: ['count', 'box'] },
];
const BATCH_ABSENT = ['.lf-srow', '.lf-anchor', '.lf-num', '.lf-mid'];

const TASTING_ELEMENTS = [
  { selector: '.lf-datebox', checks: ['box'] }, // the first thing on the page: its top is 144 px below the picture's top
  { selector: '.lf-title', checks: ['box'] },
  { selector: '.lf-line', checks: ['count', 'box'] },
  { selector: '.lf-srow', checks: ['count', 'box'] },
  { selector: '.lf-anchor', checks: ['count', 'text', 'box'] },
  { selector: '.lf-num', checks: ['count', 'text'] },
  { selector: '.lf-srow .lf-mid', checks: ['count'] },
];

// The foot's box and face are compared on every page. Its words only on the Mexican Chocolate page,
// where the board's foot is as built (p12.py:36: 'Mexican Chocolate · Version 1 · v1 · 4144-RCQJ ·
// Side 2 of 2'). p12.py:32, 34 and 163 wrote example words ('Coffee · Version 1 · [Sheet code]',
// 'Mint chip · Version 1 · [Sheet code]') into the Coffee and Mint chip feet, while the injected
// cases keep the Olive Oil v1 identity and its real code (the build prints 'Olive Oil Ice Cream ·
// Version 1 · 50 g oil · 800 g · 64JH-G408 · Side n of 2'), and CONTRACT section 3 says the foot
// reads the recipe, the version and the Sheet code as built. So the missing text check on those
// feet is a declared substitution, not a dropped element; the stored Sheet code in a real foot is
// checked where the identity is real, by 12-03's round trip (each log page's foot carries the made
// version's stored sheetCode, in A and again in B).
const FOOT_FACE = { selector: '.lf-foot', checks: ['box', 'font'] };
const FOOT_WORDS = { selector: '.lf-foot', checks: ['box', 'font', 'text'] };

export default {
  board: BOARD,
  panels: [
    // The two "As built today, for comparison" pages (.dl-page indexes 0 and 1) are not targets.
    logPanel({ caseKey: 'two', label: 'log-batch', index: 2, anchor: BATCH_ANCHOR, elements: BATCH_ELEMENTS, absent: BATCH_ABSENT, foot: FOOT_FACE }),
    logPanel({ caseKey: 'two', label: 'log-tasting-coffee', index: 3, anchor: TASTING_ANCHOR, elements: TASTING_ELEMENTS, foot: FOOT_FACE }),
    logPanel({ caseKey: 'one', label: 'log-tasting-mint-chip', index: 4, anchor: TASTING_ANCHOR, elements: TASTING_ELEMENTS, foot: FOOT_FACE }),
    logPanel({ caseKey: 'none', label: 'log-tasting-mexican-chocolate', index: 5, anchor: TASTING_ANCHOR, elements: TASTING_ELEMENTS, foot: FOOT_WORDS }),
  ],
};
