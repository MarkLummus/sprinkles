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

const BOARD = '.planning/sketches/016-entry-points-pen-preview-row-controls/pen-preview-step.html';

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

// Coffee made through the creation editor's own controls, saved, Next version opened and step 1's
// Edit this step pressed: the state pv-pen draws. The words are Sid's, as in p12g2-capture.mjs.
async function openPen(page) {
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

const penOnSteps = async (page) => {
  await openPen(page);
  await page.locator('[aria-label="Step 1, Preview step"]').click();
  await page.waitForSelector('.mk-preview');
  await page.waitForTimeout(300);
};

// What both pen panels hold: the open step's controls in order (words and names), its two fields, the
// one line that holds Preview step alone, the uses line and Done and Cancel. The method region is the
// anchor on both sides: it matches once in the board panel and once in the app's shell.
const PEN_ELEMENTS = [
  { selector: '.method-step__body button', checks: ['count', 'text', { attr: 'aria-label' }, 'box'] },
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

export default {
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
  ],
};
