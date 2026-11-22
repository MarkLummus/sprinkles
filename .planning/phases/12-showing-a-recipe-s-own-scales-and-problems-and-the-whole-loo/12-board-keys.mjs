// 12-13: the creation editor's key lines and key states of sketch 016 (row-controls.html) held
// against the build, panel by panel, on 12-07's engine (12-board-check.mjs). Conformance is board
// against build in Playwright WebKit with a coarse pointer at 1 px, never prose or a test count
// (D-14; sketch 016 README, Authority). CONTRACT section 6 and section 11 (numbers 7 and 8) are what
// the panels hold:
//   - one `p.mk-keys` line under each region's heading row (under the region name alone while the
//     picker is open), the words and the font and the box;
//   - aria-keyshortcuts on a step's and a row's add and move buttons, and on no other control: the
//     headings' Add step and Add ingredient carry none;
//   - the four key states: kr-press (the caret in Step 1's instruction, nothing pressed), kr-added
//     (the same, after Cmd+Return: a step lands after it, focus in its lead-in), kr-move (the caret
//     in Step 1's instruction, nothing pressed), kr-moved (the same, after Ctrl+Cmd+Down: the steps
//     in the moved order, the caret in Step 2's instruction). Only the "after" entries press the key.
// Unlike 12-board-rowcontrols.mjs, whose boxes stop at the table and the step list, every entry here
// is anchored on the whole region (`.ingredient-table-region`, `.method-region`), so the heading row
// and the keys line count and the region's own height is compared (`pageHeight`).
//
// Eight entries over seven panels (a panel holding both regions gets one entry per region, the anchor
// must match once), labelled `keys-<pid>-ing` or `keys-<pid>-method`: 12-board-check.mjs prints
// `PASS selftest <label>` only, so the label tells this spec's lines from 12-board-rowcontrols.mjs's
// and keeps the two specs' `--evidence` files apart when they run together (review item 9).
//   - rc-drawn: both regions, the Coffee example as first written;
//   - rc-full: Instructions only, step 1 with a target, a purpose and an aside written;
//   - ai-pick: Ingredients only, the picker open from Heavy cream's Add ingredient. The board lists 11
//     picker rows and the app the whole library, so the region's height is not compared and `.pick`
//     itself is never boxed: the heading, the keys line and the table are;
//   - kr-press, kr-added, kr-move, kr-moved: Instructions only.
// The board's panels are the built app's markup, so each entry's steps make the Coffee recipe through
// the editor's own controls (12-board-rowcontrols.mjs's coffeeBase, the p12g2-capture.mjs desk flow)
// and replay the flow that made the panel's state; the two "after" states press the real combination
// (Meta+Enter, Control+Meta+ArrowDown). The example words are Sid's. Everything typed is English.
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   PROBE_DIST="$S/dist-13" node .planning/phases/12-*/12-board-check.mjs \
//     .planning/phases/12-*/12-board-rowcontrols.mjs .planning/phases/12-*/12-board-keys.mjs \
//     --selftest --evidence "$S/evidence-13"
// Device-unverified: Playwright WebKit on a Mac, not Mark's iPad (PROOF-02's rows).
import { coffeeBase } from './12-board-rowcontrols.mjs';

const BOARD = '.planning/sketches/016-entry-points-pen-preview-row-controls/row-controls.html';
const panelSelector = (pid) => `.fp-win.g2w-1366[data-pid="${pid}"]`;

// ---------------------------------------------------------------------------
// The flows. Each one leaves the page on the creation editor with the state the panel draws.
// ---------------------------------------------------------------------------
const escaped = (name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const label = (page, text) => page.locator(`[aria-label="${text}"]`);
const pickRow = (page, name) =>
  page.locator('.pick__row', { has: page.locator('.pick__name', { hasText: new RegExp(`^${escaped(name)}$`) }) });

// The first click after a navigation can miss: press until what the press opens stands.
async function clickUntil(page, target, selector) {
  for (let i = 0; i < 6; i += 1) {
    await target().first().click();
    try {
      await page.waitForSelector(selector, { timeout: 1200 });
      return;
    } catch {
      // try again
    }
  }
  throw new Error(`never appeared: ${selector}`);
}

// Add ingredient on a row: the picker opens, the pick lands right after that row (D-09).
async function addAfter(page, afterName, name, grams) {
  await clickUntil(page, () => label(page, `Add ingredient after ${afterName}`), '.pick');
  await pickRow(page, name).click();
  await page.waitForSelector('.pick', { state: 'detached' });
  await page.fill(`[aria-label="${name}, grams"]`, grams);
}

// Step 1 with a target, a purpose and an aside written, Egg yolk right after Heavy cream (ed_full).
async function stepFull(page) {
  await coffeeBase(page);
  await addAfter(page, 'Heavy cream, 36% fat', 'Egg yolk (fresh)', '60');
  await addAfter(page, 'Fine sea salt', 'Cinnamon', '2');
  await label(page, 'Step 1, Add target').click();
  await page.fill('[aria-label="Step 1, target label"]', 'Heat to');
  await page.fill('[aria-label="Step 1, target value"]', '82 °C');
  await label(page, 'Step 1, add purpose').click();
  await page.fill('[aria-label="Step 1, purpose"]', 'Pulls the coffee into the cream.');
  await label(page, 'Step 1, add aside').click();
  await page.fill('[aria-label="Step 1, aside"]', 'Do not let it boil.');
  await page.waitForTimeout(300);
}

// The caret in Step 1's instruction, nothing pressed: the state before a key (kr-press, kr-move).
async function caretInInstruction(page) {
  await stepFull(page);
  await label(page, 'Step 1, instruction').focus();
  await page.waitForTimeout(200);
}

// The key pressed there: Cmd+Return (kr-added), Ctrl+Cmd+Down (kr-moved).
const afterKey = (combo) => async (page) => {
  await caretInInstruction(page);
  await page.keyboard.press(combo);
  await page.waitForTimeout(400);
};

// The picker opened from Heavy cream's Add ingredient (the board's second picture of ai-pick).
async function pickerFromRow(page) {
  await coffeeBase(page);
  await clickUntil(page, () => label(page, 'Add ingredient after Heavy cream, 36% fat'), '.pick');
  await page.waitForTimeout(300);
}

// Nothing holds focus when the boxes are read: a focused field's own ring is not drawn on the board.
// The four key states keep it: their `focus` check reads it.
const settle = (flow) => async (page) => {
  await flow(page);
  await page.evaluate(() => document.activeElement?.blur());
  await page.waitForTimeout(200);
};

// ---------------------------------------------------------------------------
// What each entry compares.
// ---------------------------------------------------------------------------
const ING = { anchor: '.ingredient-table-region', scope: '.ingredient-table-region' };
const METHOD = { anchor: '.method-region', scope: '.method-region' };

const headAndLine = [
  { selector: '.mk-head-row', checks: ['count', 'box'] },
  { selector: 'h2.region-name', checks: ['count', 'text', 'box'] },
  { selector: 'p.mk-keys', checks: ['count', 'text', 'font', 'box'] },
  // The heading's own control carries no key attribute (CONTRACT section 6).
  { selector: '.mk-head-act', checks: ['count', 'text', 'box', { attr: 'aria-keyshortcuts' }] },
];

const rowButtons = [
  { selector: '.mk-row-acts button', checks: ['count', 'text', { attr: 'aria-label' }, { attr: 'aria-keyshortcuts' }] },
  { selector: 'tr[data-line]', checks: ['count', 'box'] },
];

const stepButtons = [
  { selector: 'li.mk-step button', checks: ['count', 'text', { attr: 'aria-label' }, { attr: 'data-act' }, { attr: 'aria-keyshortcuts' }] },
  { selector: 'li.mk-step', checks: ['count', 'box'] },
];

function entry({ pid, region, flow, elements, absent, pageHeight = true, keepFocus = false }) {
  const regionKind = region === 'ing' ? ING : METHOD;
  return {
    id: `keys-${pid}-${region}`,
    label: `keys-${pid}-${region}`,
    width: 1366,
    panelSelector: panelSelector(pid),
    panelIndex: 0,
    route: '/notebook',
    library: 'current',
    ready: '.nb__head',
    steps: keepFocus ? flow : settle(flow),
    ...regionKind,
    ...(pageHeight ? { pageHeight: true } : {}),
    elements,
    ...(absent ? { absent } : {}),
  };
}

export default {
  board: BOARD,
  panels: [
    entry({ pid: 'rc-drawn', region: 'ing', flow: coffeeBase, elements: [...headAndLine, ...rowButtons] }),
    entry({ pid: 'rc-drawn', region: 'method', flow: coffeeBase, elements: [...headAndLine, ...stepButtons] }),
    entry({ pid: 'rc-full', region: 'method', flow: stepFull, elements: [...headAndLine, ...stepButtons] }),
    // The picker open from a row: the heading's Add ingredient is away, so the line stands under the
    // region name alone (CONTRACT section 11, number 7). The board lists 11 picker rows and the app
    // the whole library: no region height, no `.pick` box.
    entry({
      pid: 'ai-pick',
      region: 'ing',
      flow: pickerFromRow,
      pageHeight: false,
      elements: [
        { selector: 'h2.region-name', checks: ['count', 'text', 'box'] },
        { selector: 'p.mk-keys', checks: ['count', 'text', 'font', 'box'] },
        ...rowButtons,
      ],
      absent: ['.mk-head-row', '.mk-head-act'],
    }),
    // The four key states. The "before" entries place the caret and press nothing; the "after" entries
    // press the key. `focus` reads document.activeElement in the app.
    entry({
      pid: 'kr-press',
      region: 'method',
      flow: caretInInstruction,
      keepFocus: true,
      elements: [
        ...headAndLine,
        ...stepButtons,
        { selector: 'li.mk-step textarea', checks: ['count', 'value', 'box'] },
        { selector: '[aria-label="Step 1, instruction"]', checks: ['count', 'focus'] },
      ],
    }),
    entry({
      pid: 'kr-added',
      region: 'method',
      flow: afterKey('Meta+Enter'),
      keepFocus: true,
      elements: [
        ...headAndLine,
        ...stepButtons,
        { selector: 'li.mk-step textarea', checks: ['count', 'value', 'box'] },
        { selector: '[aria-label="Step 2, lead-in"]', checks: ['count', 'focus'] },
      ],
    }),
    entry({
      pid: 'kr-move',
      region: 'method',
      flow: caretInInstruction,
      keepFocus: true,
      elements: [
        ...headAndLine,
        ...stepButtons,
        { selector: 'li.mk-step textarea', checks: ['count', 'value', 'box'] },
        { selector: '[aria-label="Step 1, instruction"]', checks: ['count', 'focus'] },
      ],
    }),
    entry({
      pid: 'kr-moved',
      region: 'method',
      flow: afterKey('Control+Meta+ArrowDown'),
      keepFocus: true,
      elements: [
        ...headAndLine,
        ...stepButtons,
        { selector: 'li.mk-step textarea', checks: ['count', 'value', 'box'] },
        { selector: '[aria-label="Step 2, instruction"]', checks: ['count', 'focus'] },
      ],
    }),
  ],
};
