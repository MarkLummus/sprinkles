// 12-12: the creation editor's row controls of sketch 016 (row-controls.html) held against the
// build, panel by panel, on 12-07's engine (12-board-check.mjs, with its fifth change: the board's
// purple notes `.dl-tab` and `.dl-flag` are left out of the board side). Conformance is board
// against build in Playwright WebKit with a coarse pointer at 1 px, never prose or a test count
// (D-14; sketch 016 README, Authority). CONTRACT section 5 is what the panels hold:
//   - a step's controls in two groups: the step's own (targets with Add purpose, the uses line,
//     Add aside and Preview step on a second targets line), then Add step, Move up, Move down,
//     Remove on its last line;
//   - an ingredient row's: Add to step while it is in no step, then Add ingredient, Move up,
//     Move down, Remove; Add ingredient opens the picker in its built place and the pick lands
//     right after that row, in its step.
// Seven panels, nine entries: a panel holding both regions gets one entry per region (the anchor
// must match once), labelled `rowcontrols-<pid>-ing` or `rowcontrols-<pid>-method` so the
// --selftest lines and the --evidence files stay apart from 12-board-keys.mjs's (review item 4,
// item 9). The Ingredients entries are anchored on `.ingredient-table` (scope
// `.ingredient-table-region`) and the Instructions entries on `.method-region > ol.method-steps`
// (scope `.method-region`), so the region heads, where 12-13 adds the keys line, are outside the
// measured boxes. What each panel validly draws, and so what each entry checks:
//   - rc-drawn: both regions, the Coffee example as first written;
//   - rc-full: Instructions only, step 1 with a target, a purpose and an aside written;
//   - kr-preview: Instructions only. The board's `.mk-preview` holds the build's preview of a
//     two-field step (the lead-in only, 44 px) inside a step with a target, a purpose and an aside
//     written, while the app's preview draws all of them (CONTRACT section 9, bullet 2: on this panel
//     only the block's place is valid). So the entry checks step 1's controls and fields above the
//     preview, the second targets line holding Hide preview, the preview's cue and its lead, and
//     nothing at or below the preview's foot;
//   - ai-press, ai-unplaced: Ingredients only (the row checks);
//   - ai-pick: Ingredients only. The board lists 11 picker rows, the app the whole library, so `.pick`
//     itself is never boxed: its head, its filters and its first eleven rows are;
//   - ai-step: both regions, Egg yolk landed right after Heavy cream in Step 1.
// No `aria-keyshortcuts` check here: 12-13 adds the attribute and its spec checks it.
//
// The board's panels are the built app's markup, so each entry's steps make the Coffee recipe
// through the editor's own controls (.planning/canvas-generators/p12g2-capture.mjs and
// p12g2c-capture.mjs) and replay the flow that made the panel's state; the two "after" states are
// made with the row's Add ingredient. The example words are Sid's. Everything typed is English.
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   PROBE_DIST="$S/dist-12" node .planning/phases/12-*/12-board-check.mjs \
//     .planning/phases/12-*/12-board-rowcontrols.mjs --selftest --evidence "$S/evidence-12"

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

async function addFromHeading(page, name, grams) {
  await clickUntil(page, () => page.locator('.ingredient-table-region .mk-head-act'), '.pick');
  await pickRow(page, name).click();
  await page.waitForSelector('.pick', { state: 'detached' });
  await page.fill(`[aria-label="${name}, grams"]`, grams);
}

// Add ingredient on a row: the picker opens, the pick lands right after that row (D-09).
async function addAfter(page, afterName, name, grams) {
  await clickUntil(page, () => label(page, `Add ingredient after ${afterName}`), '.pick');
  await pickRow(page, name).click();
  await page.waitForSelector('.pick', { state: 'detached' });
  await page.fill(`[aria-label="${name}, grams"]`, grams);
}

const uses = (page, n, name) =>
  page.locator(`.method-step[data-step="${n}"] .method-step__uses-item`, { hasText: name }).locator('input');

// The Coffee example as first written: four rows, two steps (ed_base). Exported for 12-tab-probe.mjs.
export async function coffeeBase(page) {
  await clickUntil(page, () => page.locator('.nb__head .notebook-action'), '.nb__new textarea');
  await page.fill('.nb__new textarea', 'Coffee');
  await page.locator('.nb__new-actions button', { hasText: /^Start$/ }).click();
  await page.waitForSelector('.ingredient-table-region');
  await page.fill('textarea[aria-label="Recipe description"]', 'Strong and cold.');
  for (const [name, grams] of [
    ['Heavy cream, 36% fat', '400'],
    ['Coffee beans', '40'],
    ['Dextrose', '120'],
    ['Fine sea salt', '1'],
  ]) {
    await addFromHeading(page, name, grams);
  }
  await clickUntil(page, () => page.locator('.method-region .mk-head-act'), '[aria-label="Step 1, lead-in"]');
  await page.fill('[aria-label="Step 1, lead-in"]', 'Steep');
  await page.fill('[aria-label="Step 1, instruction"]', 'Warm the cream with the beans, then strain.');
  await label(page, 'Step 1, change ingredients').click();
  await uses(page, 1, 'Heavy cream').click();
  await uses(page, 1, 'Coffee beans').click();
  await label(page, 'Step 1, done').click();
  await label(page, 'Step 1, Add step after it').click();
  await page.waitForSelector('[aria-label="Step 2, lead-in"]');
  await page.fill('[aria-label="Step 2, lead-in"]', 'Churn');
  await page.fill('[aria-label="Step 2, instruction"]', 'Chill the base, then churn.');
  await label(page, 'Step 2, change ingredients').click();
  await uses(page, 2, 'Dextrose').click();
  await label(page, 'Step 2, done').click();
  await page.waitForTimeout(300);
}

// Egg yolk right after Heavy cream in Step 1, ticked in its Uses (ed_after_step).
async function afterStep(page) {
  await coffeeBase(page);
  await addAfter(page, 'Heavy cream, 36% fat', 'Egg yolk (fresh)', '60');
  await page.waitForTimeout(300);
}

// Cinnamon right after Fine sea salt, under Not in a step yet (ed_after_unplaced).
async function afterUnplaced(page) {
  await afterStep(page);
  await addAfter(page, 'Fine sea salt', 'Cinnamon', '2');
  await page.waitForTimeout(300);
}

// Step 1 with a target, a purpose and an aside written (ed_full).
async function stepFull(page) {
  await afterUnplaced(page);
  await label(page, 'Step 1, Add target').click();
  await page.fill('[aria-label="Step 1, target label"]', 'Heat to');
  await page.fill('[aria-label="Step 1, target value"]', '82 °C');
  await label(page, 'Step 1, add purpose').click();
  await page.fill('[aria-label="Step 1, purpose"]', 'Pulls the coffee into the cream.');
  await label(page, 'Step 1, add aside').click();
  await page.fill('[aria-label="Step 1, aside"]', 'Do not let it boil.');
  await page.locator('[aria-label="Step 1, lead-in"]').focus();
  await page.waitForTimeout(300);
}

async function stepPreview(page) {
  await stepFull(page);
  await label(page, 'Step 1, Preview step').click();
  await page.waitForSelector('.mk-preview');
  await page.waitForTimeout(300);
}

// The picker opened from Heavy cream's Add ingredient (the board's second picture of ai-pick).
async function pickerFromRow(page) {
  await coffeeBase(page);
  await clickUntil(page, () => label(page, 'Add ingredient after Heavy cream, 36% fat'), '.pick');
  await page.waitForTimeout(300);
}

// Nothing holds focus when the boxes are read: a focused field's own ring is not drawn on the board.
const settle = (flow) => async (page) => {
  await flow(page);
  await page.evaluate(() => document.activeElement?.blur());
  await page.waitForTimeout(200);
};

// ---------------------------------------------------------------------------
// What each entry compares.
// ---------------------------------------------------------------------------
const ING = { anchor: '.ingredient-table', scope: '.ingredient-table-region' };
const METHOD = { anchor: '.method-region > ol.method-steps', scope: '.method-region' };

const rowActs = [
  { selector: '.mk-row-acts button', checks: ['count', 'text', 'box', { attr: 'aria-label' }, { attr: 'data-act' }] },
  { selector: 'tr[data-line]', checks: ['count', 'box'] },
  { selector: '.ingredient-table__col-name', checks: ['text'] },
];

const stepChecks = [
  { selector: 'li.mk-step button', checks: ['count', 'text', 'box', { attr: 'aria-label' }, { attr: 'data-act' }] },
  { selector: 'p.method-step__targets', checks: ['count', 'box'] },
  { selector: 'p.method-step__uses-line', checks: ['count', 'box'] },
  { selector: 'p.method-step__acts', checks: ['count', 'box'] },
];

function entry({ pid, region, flow, elements, absent }) {
  const regionKind = region === 'ing' ? ING : METHOD;
  return {
    id: `rowcontrols-${pid}-${region}`,
    label: `rowcontrols-${pid}-${region}`,
    width: 1366,
    panelSelector: panelSelector(pid),
    panelIndex: 0,
    route: '/notebook',
    library: 'current',
    ready: '.nb__head',
    steps: settle(flow),
    ...regionKind,
    elements,
    ...(absent ? { absent } : {}),
  };
}

export default {
  board: BOARD,
  panels: [
    entry({ pid: 'rc-drawn', region: 'ing', flow: coffeeBase, elements: rowActs }),
    entry({ pid: 'rc-drawn', region: 'method', flow: coffeeBase, elements: stepChecks }),
    entry({ pid: 'rc-full', region: 'method', flow: stepFull, elements: stepChecks }),
    // The preview's block is a two-field step's on the board and the build's full reading in the app:
    // checked down to the preview's lead, and nothing at or below its foot (not `.mk-preview` itself,
    // not step 1's acts line, not step 2).
    entry({
      pid: 'kr-preview',
      region: 'method',
      flow: stepPreview,
      elements: [
        { selector: 'li.mk-step[data-step="1"] .method-step__targets button', checks: ['count', 'text', 'box', { attr: 'aria-label' }] },
        { selector: 'li.mk-step[data-step="1"] .method-step__uses-line button', checks: ['count', 'text', 'box', { attr: 'aria-label' }] },
        { selector: 'li.mk-step[data-step="1"] textarea', checks: ['count', 'box'] },
        { selector: 'li.mk-step[data-step="1"] > .method-step__body > p.method-step__targets', checks: ['count', 'box'] },
        { selector: 'li.mk-step[data-step="1"] button[aria-label="Step 1, Hide preview"]', checks: ['text', 'box', { attr: 'aria-label' }] },
        { selector: '.mk-preview__cue', checks: ['text', 'box'] },
        { selector: '.mk-preview .method-step__lead', checks: ['text', 'box', 'font'] },
      ],
    }),
    entry({ pid: 'ai-press', region: 'ing', flow: coffeeBase, elements: rowActs }),
    // The board lists 11 picker rows and the app the whole library: `.pick` is never boxed, and the
    // heading's Add ingredient is away while the picker is open (CONTRACT section 5).
    entry({
      pid: 'ai-pick',
      region: 'ing',
      flow: pickerFromRow,
      elements: [
        ...rowActs,
        { selector: '.pick__head', checks: ['text', 'box'] },
        { selector: '.pick .ing__filters', checks: ['box'] },
        { selector: '.pick__list > li:nth-child(-n+11) > .pick__row', checks: ['count', 'text', 'box'] },
      ],
      absent: ['.mk-head-act'],
    }),
    entry({ pid: 'ai-step', region: 'ing', flow: afterStep, elements: rowActs }),
    entry({
      pid: 'ai-step',
      region: 'method',
      flow: afterStep,
      elements: [
        { selector: 'p.method-step__uses-line', checks: ['count', 'text', 'box'] },
        { selector: 'li.mk-step button', checks: ['count', 'text', 'box', { attr: 'aria-label' }] },
      ],
    }),
    entry({ pid: 'ai-unplaced', region: 'ing', flow: afterUnplaced, elements: rowActs }),
  ],
};
