// 12-11: Preview step in the version pen (sketch 016, pen-preview-step.html; CONTRACT section 7 and
// section 11, number 6; Mark's List bug-p11-pen-step-no-preview) held against the build, panel by
// panel, on 12-07's engine (12-board-check.mjs, used as it stands). Conformance is board against
// build in Playwright WebKit with a coarse pointer at 1 px, never prose or a test count (D-14;
// sketch 013's rule). The panels this file holds are the drawn ones, pv-pen and pv-pen-on; the
// as-built panels pv-editor and pv-pen-built are not targets (the bug panel is what the build
// used to be).
//   - pv-pen:    Next version, step 1 open: one p.method-step__targets holding Preview step alone
//                (aria-label "Step 1, Preview step") under the two fields and before the uses line;
//                no div.mk-preview;
//   - pv-pen-on: the same, Preview step pressed: the control reads Hide preview and div.mk-preview
//                (role group, "Step 1, preview") stands under it with the step as it will read;
//   - Tab order (CONTRACT section 7, "after the instruction and before Change ingredients"): the
//     same pv-pen state, focus put in the instruction and Tab pressed once (Preview step has focus)
//     and twice (Change ingredients has focus), read back from document.activeElement in the app.
//     The Tab walk the engine reads is the app's; the board draws no focus.
// The board's panels are the built app's markup, so each case is the app with the desk flow of
// .planning/canvas-generators/p12g2-capture.mjs replayed in its own throwaway IndexedDB: Coffee made
// through the creation editor with the board's own words (Sid's), Save, Next version, and Step 1's
// Edit this step. Nothing here seeds a record by hand.
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   npm --prefix app run build -- --outDir "$S/dist-11" --emptyOutDir
//   PROBE_DIST="$S/dist-11" node .planning/phases/12-*/12-board-check.mjs \
//     .planning/phases/12-*/12-board-penpreview.mjs --selftest
//
// Every result is Playwright WebKit on a Mac: device-unverified.
//
// Quick 261123-ghk (sketch 017, the version pen: changing the order of steps) adds a second spec to
// this file and scopes one selector. Which board each spec holds:
//   - pen-preview-step.html (the first spec) holds the OPEN step 1. Its first PEN_ELEMENTS selector is
//     now `.method-steps > li:first-child .method-step__body button`: that board draws step 2 closed
//     with Edit this step and Remove alone, drawn before Move up and Move down joined the closed
//     step's line, so it can no longer hold the whole method region. Every check kind of that selector
//     is kept (count, text, aria-label, box); the closed step line is held by the second spec below.
//   - pen-step-order.html (the second spec), four panels at 1366, slice 1 of the step order (README
//     decisions 2 to 7 and 11, CONTRACT sections 2 and 3): pm-moves (every closed step's acts line,
//     margin numbers, lead lines and the controls' names), pm-once and pm-twice (focus after one and
//     two presses of Move up, the moved step's Move up), pm-table (the Ingredients table's step heads
//     and lines follow the draft's order). The flow replays p12pm-capture.mjs steps 1 to 3: Coffee,
//     Rest moved up once, Save, Next version.
// Quick 261123-iqe (slice 2, choice A: the words " was step N", CONTRACT section 5) holds, with every
// check kind kept: the leads and the skipped-label spans of pm-once and pm-twice, pm-removed (with one
// stated allowance), pm-open, and step-order-shown.html's so-a, so-read and so-table (a third spec).
// The allowance on pm-removed is the removed step's number cell: the board draws it 0 wide, the app
// gives it one figure's width since 261123-ghg (dc03ad5c). So the removed step's body stands 12 px
// right (11.1 in Chrome), its li is 4 px taller, and Churn under it sits 4 px lower. Boxes are held
// on the three steps above the removed one only; every count, text, font, aria and size check stays
// on every step.

const BOARD = '.planning/sketches/016-entry-points-pen-preview-row-controls/pen-preview-step.html';
const STEP_ORDER_BOARD = '.planning/sketches/017-pen-step-order/pen-step-order.html';
const STEP_ORDER_SHOWN_BOARD = '.planning/sketches/017-pen-step-order/step-order-shown.html';

const WIN = (pid) => `.fp-win.g2w-1366[data-pid="${pid}"]`;

// A first click after a navigation can miss (memory: chrome-first-click-after-navigate): press again
// until what the click opens appears.
const clickUntil = async (page, target, selector) => {
  for (let i = 0; i < 6; i++) {
    await target().first().click();
    try {
      await page.waitForSelector(selector, { timeout: 1200 });
      return;
    } catch {
      // try again
    }
  }
  throw new Error(`never appeared: ${selector}`);
};

// The creation editor's own controls, as both flows below press them: a control by its name, an
// ingredient's row in the picker, an ingredient added, and a step's Uses checkbox for an ingredient.
function helpers(page) {
  const label = (text) => page.locator(`[aria-label="${text}"]`);
  const pickRow = (name) =>
    page.locator('.pick__row', {
      has: page.locator('.pick__name', { hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }),
    });
  const add = async (name, grams) => {
    await clickUntil(page, () => page.locator('.ingredient-table-region .mk-head-act'), '.pick');
    await pickRow(name).click();
    await page.waitForSelector('.pick', { state: 'detached' });
    await page.fill(`[aria-label="${name}, grams"]`, grams);
  };
  const use = (n, name) =>
    page.locator(`.method-step[data-step="${n}"] .method-step__uses-item`, { hasText: name }).locator('input');
  return { label, pickRow, add, use };
}

// Coffee made through the creation editor's own controls, saved, Next version opened and step 1's
// Edit this step pressed: the state pv-pen draws. The words are Sid's, as in p12g2-capture.mjs.
async function openPen(page) {
  const { label, pickRow, add, use } = helpers(page);

  await page.waitForSelector('.nb__head');
  await page.waitForTimeout(700);
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
    await add(name, grams);
  }
  await clickUntil(page, () => page.locator('.method-region .mk-head-act'), '[aria-label="Step 1, lead-in"]');
  await page.fill('[aria-label="Step 1, lead-in"]', 'Steep');
  await page.fill('[aria-label="Step 1, instruction"]', 'Warm the cream with the beans, then strain.');
  await label('Step 1, change ingredients').click();
  await use(1, 'Heavy cream').click();
  await use(1, 'Coffee beans').click();
  await label('Step 1, done').click();
  await label('Step 1, Add step after it').click();
  await page.waitForSelector('[aria-label="Step 2, lead-in"]');
  await page.fill('[aria-label="Step 2, lead-in"]', 'Churn');
  await page.fill('[aria-label="Step 2, instruction"]', 'Chill the base, then churn.');
  await label('Step 2, change ingredients').click();
  await use(2, 'Dextrose').click();
  await label('Step 2, done').click();
  await page.waitForTimeout(300);
  // Egg yolk lands right after Heavy cream in Step 1, ticked in its Uses (heading Add ingredient, Add
  // to step, Move up), so the step's uses line reads as the board's.
  await clickUntil(page, () => page.locator('.ingredient-table-region .mk-head-act'), '.pick');
  await pickRow('Egg yolk (fresh)').click();
  await page.waitForSelector('.pick', { state: 'detached' });
  await page.fill('[aria-label="Egg yolk (fresh), grams"]', '60');
  await label('Add to step, Egg yolk (fresh)').click();
  await label('Step 1, Steep: add Egg yolk (fresh)').click();
  await page.waitForTimeout(200);
  await label('Move up, Egg yolk (fresh)').click();
  await page.waitForTimeout(1500);

  // Save through the kept draft, then Next version on the saved version.
  await page.goto(new URL('/notebook/new', page.url()).href, { waitUntil: 'load' });
  await page.waitForSelector('.ingredient-table-region');
  await page.waitForTimeout(700);
  await page.click('.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)');
  await page.waitForSelector('.notebook-version');
  await page.waitForTimeout(800);
  const saved = new URL(page.url()).pathname;
  await page.goto(new URL(saved, page.url()).href, { waitUntil: 'load' });
  await page.waitForSelector('.notebook-version');
  await page.waitForTimeout(700);
  await clickUntil(page, () => page.locator('.notebook-version__acts button', { hasText: /^Next version$/ }), '.notebook-ceremony');
  await page.waitForTimeout(400);
  await label('Step 1, edit this step').click();
  await page.waitForSelector('.method-step__open-fields');
  await page.waitForTimeout(300);
}

// Sketch 017's example, replaying p12pm-capture.mjs steps 1 to 3 with the board's words: Coffee made
// through the creation editor (four ingredients, five steps Steep, Strain, Sweeten, Rest, Churn), Rest
// moved up once with its Move up focused and Enter (so the stored keys read 1, 2, 4, 3, 5), Save, then
// Next version with Version name "sweeten warm". The state pm-moves draws.
async function openStepOrderPen(page) {
  const { label, add, use } = helpers(page);
  await page.waitForSelector('.nb__head');
  await page.waitForTimeout(700);
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
    await add(name, grams);
  }
  const STEPS = [
    ['Steep', 'Warm the cream with the beans and hold for ten minutes.'],
    ['Strain', 'Strain out the beans.'],
    ['Sweeten', 'Stir in the dextrose and the salt.'],
    ['Rest', 'Rest the base for an hour.'],
    ['Churn', 'Chill the base, then churn.'],
  ];
  await clickUntil(page, () => page.locator('.method-region .mk-head-act'), '[aria-label="Step 1, lead-in"]');
  for (let i = 0; i < STEPS.length; i++) {
    const n = i + 1;
    await page.fill(`[aria-label="Step ${n}, lead-in"]`, STEPS[i][0]);
    await page.fill(`[aria-label="Step ${n}, instruction"]`, STEPS[i][1]);
    if (i < STEPS.length - 1) {
      await label(`Step ${n}, Add step after it`).click();
      await page.waitForSelector(`[aria-label="Step ${n + 1}, lead-in"]`);
    }
  }
  await label('Step 1, change ingredients').click();
  await use(1, 'Heavy cream').click();
  await use(1, 'Coffee beans').click();
  await label('Step 1, done').click();
  await label('Step 3, change ingredients').click();
  await use(3, 'Dextrose').click();
  await use(3, 'Fine sea salt').click();
  await label('Step 3, done').click();
  await page.waitForTimeout(300);
  // Rest goes up: Steep, Strain, Rest, Sweeten, Churn.
  await label('Step 4, move up').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  await page.click('.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)');
  await page.waitForSelector('.notebook-version');
  await page.waitForTimeout(800);
  await clickUntil(page, () => page.locator('.notebook-version__acts button', { hasText: /^Next version$/ }), '.notebook-ceremony');
  await page.waitForTimeout(400);
  await page.fill('[aria-label="Version name"]', 'sweeten warm');
  await page.waitForTimeout(300);
}

// The same state with each named Move up pressed in turn: Sweeten up once (pm-once), then up again
// (pm-twice and pm-table).
const stepOrderPressed = (...presses) => async (page) => {
  await openStepOrderPen(page);
  for (const press of presses) {
    await page.locator(`[aria-label="${press}"]`).click();
    await page.waitForTimeout(300);
  }
};

// The pm-open state: the same, with a step's Edit this step pressed after the moves.
const openedStep = (opener) => async (page) => {
  await stepOrderPressed('Step 4, move up', 'Step 3, move up')(page);
  await page.locator(`[aria-label="${opener}"]`).click();
  await page.waitForSelector('.method-step__open-fields');
  await page.waitForTimeout(300);
};

// Sketch 017 CONTRACT section 5, choice A (slice 2): the leads and their " was step N" spans.
const MARKED_LEADS = [
  { selector: 'p.method-step__lead', checks: ['count', 'text', 'box', 'font'] },
  { selector: 'span.method-step__skipped-label', checks: ['count', 'text', 'box', 'font'] },
];

const penOnSteps = async (page) => {
  await openPen(page);
  await page.locator('[aria-label="Step 1, Preview step"]').click();
  await page.waitForSelector('.mk-preview');
  await page.waitForTimeout(300);
};

// The Tab order through the open step, as the keyboard walks it in WebKit: focus put in the
// instruction (the field the maker has just written in), then Tab pressed `presses` times.
const tabSteps = (presses) => async (page) => {
  await openPen(page);
  await page.locator('[aria-label="Step 1, instruction"]').focus();
  for (let i = 0; i < presses; i++) await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
};

// What both pen panels hold: the open step's controls in order (words and names), its two fields, the
// one line that holds Preview step alone, the uses line and Done and Cancel. The method region is the
// anchor on both sides: it matches once in the board panel and once in the app's shell.
const PEN_ELEMENTS = [
  { selector: '.method-steps > li:first-child .method-step__body button', checks: ['count', 'text', { attr: 'aria-label' }, 'box'] },
  { selector: '.method-step__open-fields textarea', checks: ['count', 'value', { attr: 'aria-label' }, 'box'] },
  { selector: 'p.method-step__targets', checks: ['count', 'text', 'box'] },
  { selector: 'p.method-step__uses-line', checks: ['count', 'text', 'box'] },
  { selector: 'p.method-step__done-cancel', checks: ['count', 'box'] },
];

const penPanel = (pid, label, steps, extra) => ({
  id: label,
  label,
  width: 1366,
  panelSelector: WIN(pid),
  panelIndex: 0,
  route: '/notebook',
  library: 'current',
  ready: '.nb__head',
  steps,
  anchor: '.method-region',
  ...extra,
});

const penPreviewSpec = {
  board: BOARD,
  panels: [
    penPanel('pv-pen', 'pen-pv-pen', openPen, {
      elements: PEN_ELEMENTS,
      // Shut: no preview block and nothing inside one.
      absent: ['.mk-preview', '.mk-preview .method-step__lead'],
    }),
    penPanel('pv-pen-on', 'pen-pv-pen-on', penOnSteps, {
      elements: [
        ...PEN_ELEMENTS,
        { selector: '.mk-preview', checks: ['count', 'box', { attr: 'role' }, { attr: 'aria-label' }] },
        { selector: '.mk-preview .mk-preview__cue', checks: ['count', 'text', 'font', 'box'] },
        { selector: '.mk-preview .method-step__lead', checks: ['count', 'text', 'box', 'font'] },
      ],
    }),
    // CONTRACT section 7: Tab reaches Preview step after the instruction and before Change
    // ingredients. The same board panel as pv-pen, with a label of its own; `focus` reads
    // document.activeElement in the app, `box` keeps the panel visible to --selftest.
    penPanel('pv-pen', 'pen-pv-pen-tab1', tabSteps(1), {
      elements: [{ selector: '[aria-label="Step 1, Preview step"]', checks: ['count', 'focus', 'box'] }],
    }),
    penPanel('pv-pen', 'pen-pv-pen-tab2', tabSteps(2), {
      elements: [{ selector: '[aria-label="Step 1, change ingredients"]', checks: ['count', 'focus', 'box'] }],
    }),
  ],
};

// Sketch 017 CONTRACT sections 2 and 3, slice 1. Every check kind the Preview step spec holds is kept
// (count, text, aria-label, box, focus, font); the panels add the aria-disabled attribute and the
// table's step heads.
const stepOrderSpec = {
  board: STEP_ORDER_BOARD,
  panels: [
    // pm-moves: every closed live step reads Edit this step, Move up, Move down, Remove; the first
    // step's Move up and the last step's Move down are grey; no move keys and no keys line.
    penPanel('pm-moves', 'steporder-pm-moves', stepOrderPressed(), {
      elements: [
        { selector: 'li.method-step', checks: ['count', 'box'] },
        { selector: '.method-step__n', checks: ['count', 'text', 'box'] },
        { selector: 'p.method-step__lead', checks: ['count', 'text', 'box', 'font'] },
        { selector: 'p.method-step__acts', checks: ['count', 'box'] },
        {
          selector: 'p.method-step__acts button',
          checks: ['count', 'text', { attr: 'aria-label' }, { attr: 'aria-disabled' }, 'box'],
        },
      ],
      absent: ['[aria-keyshortcuts]', '.mk-keys'],
    }),
    // pm-once and pm-twice: after Sweeten's Move up is pressed once and twice, focus stays on that
    // button of the moved step (README decision 5). The board's purple note sits inside the button,
    // so its text is not compared. Slice 2: the leads carry " was step N" in a skipped-label span.
    penPanel('pm-once', 'steporder-pm-once-focus', stepOrderPressed('Step 4, move up'), {
      elements: [
        { selector: '[aria-label="Step 3, move up"]', checks: ['count', 'focus', 'box'] },
        ...MARKED_LEADS,
      ],
    }),
    penPanel('pm-twice', 'steporder-pm-twice-focus', stepOrderPressed('Step 4, move up', 'Step 3, move up'), {
      elements: [
        { selector: '[aria-label="Step 2, move up"]', checks: ['count', 'focus', 'box'] },
        ...MARKED_LEADS,
      ],
    }),
    // pm-removed: Rest removed after two moves. Rest reads " removed" with no number, Churn "was step
    // 5". Boxes stand on the three steps above the removed one only (the allowance in the header).
    penPanel('pm-removed', 'steporder-pm-removed', stepOrderPressed('Step 4, move up', 'Step 3, move up', 'Step 4, remove'), {
      elements: [
        { selector: 'li.method-step', checks: ['count'] },
        { selector: 'li.method-step:nth-child(-n+3)', checks: ['count', 'box'] },
        { selector: '.method-step__n', checks: ['count', 'text'] },
        { selector: 'li.method-step:nth-child(-n+3) .method-step__n', checks: ['count', 'box'] },
        { selector: 'p.method-step__lead', checks: ['count', 'text', 'font'] },
        { selector: 'li.method-step:nth-child(-n+3) p.method-step__lead', checks: ['count', 'box'] },
        { selector: 'span.method-step__skipped-label', checks: ['count', 'text', 'font', 'size'] },
        {
          selector: 'p.method-step__acts button',
          checks: ['count', 'text', { attr: 'aria-label' }, { attr: 'aria-disabled' }],
        },
        { selector: 'li.method-step:nth-child(-n+3) p.method-step__acts button', checks: ['count', 'box'] },
      ],
      absent: ['[aria-keyshortcuts]', '.mk-keys'],
    }),
    // pm-open: pm-twice with Sweeten open: " was step 4" last inside its open fields, under the two
    // fields; Strain and Rest closed and marked as in pm-twice.
    penPanel('pm-open', 'steporder-pm-open', openedStep('Step 2, edit this step'), {
      elements: [
        { selector: 'li.method-step', checks: ['count', 'box'] },
        { selector: '.method-step__n', checks: ['count', 'text', 'box'] },
        { selector: 'p.method-step__lead', checks: ['count', 'text', 'box', 'font'] },
        { selector: 'span.method-step__skipped-label', checks: ['count', 'text', 'box', 'font'] },
        {
          selector: '.method-step__open-fields textarea',
          checks: ['count', 'value', { attr: 'aria-label' }, 'box'],
        },
        {
          selector: 'p.method-step__acts button',
          checks: ['count', 'text', { attr: 'aria-label' }, { attr: 'aria-disabled' }, 'box'],
        },
        { selector: 'p.method-step__uses-line', checks: ['count', 'text', 'box'] },
        { selector: 'p.method-step__done-cancel', checks: ['count', 'box'] },
      ],
      absent: ['[aria-keyshortcuts]', '.mk-keys', '.mk-preview'],
    }),
    // pm-table: the Ingredients table's step heads and lines follow the draft's order (CONTRACT
    // section 3).
    penPanel('pm-table', 'steporder-pm-table', stepOrderPressed('Step 4, move up', 'Step 3, move up'), {
      anchor: '.ingredient-table-region',
      elements: [
        { selector: 'tr.ingredient-table__step-head', checks: ['count', 'text', 'box'] },
        { selector: 'tbody tr[aria-label]', checks: ['count', { attr: 'aria-label' }, 'box'] },
      ],
    }),
  ],
};

// The state step-order-shown.html draws: pm-removed saved as a new version (so-a with Show changes on,
// so-read and so-table with it off). The flow notes the address, saves, and waits until the address
// differs and the saved page is drawn (p12pm-capture.mjs step 4).
const savedStepOrder = (showChanges) => async (page) => {
  await stepOrderPressed('Step 4, move up', 'Step 3, move up', 'Step 4, remove')(page);
  const before = new URL(page.url()).pathname;
  await page.locator('.notebook-ceremony__actions button', { hasText: /^Save as new version$/ }).click();
  await page.waitForFunction((from) => location.pathname !== from, before);
  await page.waitForSelector('.notebook-version');
  await page.waitForFunction(() => !document.querySelector('.notebook-ceremony'));
  await page.waitForTimeout(900);
  if (showChanges) {
    await page.locator('button', { hasText: /^Show changes$/ }).first().click();
    await page.waitForSelector('.method-step__n--struck');
    await page.waitForTimeout(500);
  }
};

// Sketch 017 CONTRACT sections 5 and 6, slice 2: the saved version, with Show changes on and off.
const stepOrderShownSpec = {
  board: STEP_ORDER_SHOWN_BOARD,
  panels: [
    // so-a: Steep 1, Sweeten 2 " was step 4", Strain 3 " was step 2", Rest struck 3 " removed", Churn
    // 4 " was step 5".
    penPanel('so-a', 'steporder-so-a', savedStepOrder(true), {
      elements: [
        { selector: 'li.method-step', checks: ['count', 'box'] },
        { selector: '.method-step__n', checks: ['count', 'text', { attr: 'class' }, 'box'] },
        { selector: 'p.method-step__lead', checks: ['count', 'text', 'box', 'font'] },
        { selector: 'span.method-step__skipped-label', checks: ['count', 'text', 'box', 'font'] },
        { selector: '.method-step__prose--struck', checks: ['count', 'text', 'box'] },
      ],
      absent: ['.method-step__n-from'],
    }),
    // so-read: Show changes off: four steps numbered 1 to 4, no mark and no removed step.
    penPanel('so-read', 'steporder-so-read', savedStepOrder(false), {
      elements: [
        { selector: 'li.method-step', checks: ['count', 'box'] },
        { selector: '.method-step__n', checks: ['count', 'text', 'box'] },
        { selector: 'p.method-step__lead', checks: ['count', 'text', 'box', 'font'] },
      ],
      absent: ['.method-step__skipped-label', '.method-step__prose--struck', '.method-step__n-from'],
    }),
    // so-table: its Ingredients, step heads "Step 1 Steep" and "Step 2 Sweeten", no mark.
    penPanel('so-table', 'steporder-so-table', savedStepOrder(false), {
      anchor: '.ingredient-table-region',
      elements: [
        { selector: 'tr.ingredient-table__step-head', checks: ['count', 'text', 'box'] },
        { selector: 'tbody tr[aria-label]', checks: ['count', { attr: 'aria-label' }, 'box'] },
      ],
      absent: ['.method-step__skipped-label'],
    }),
  ],
};

export default [penPreviewSpec, stepOrderSpec, stepOrderShownSpec];
