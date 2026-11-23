// 12-16: the recipe page's head below 724 of sketch 016 (recipe-head-below-724.html) held against the
// build, panel by panel, on 12-07's engine (12-board-check.mjs, used as it stands). Conformance is board
// against build in Playwright WebKit with a coarse pointer at 1 px, never prose or a test count (D-14;
// sketch 013's rule). CONTRACT section 2 and section 11 number 2 are what the panels hold:
//   - below 724 the band's acts row holds the filled record act the version waits on (Record another,
//     Record tasting or Record batch), then the Print sheet link; Next version, Edit and Resume editing are
//     text controls below 724 as built and are left out, so `.notebook-version__acts button.notebook-link`
//     matches nothing on any panel (the record act is `button.notebook-action`);
//   - a version that can be edited reads as any not yet churned version does (no Edit);
//   - a kept edit holds the Print sheet link alone under one line right after the identity heading,
//     "Edit kept. Finish it in a wider window."; a kept Next version draft the same, under
//     "Draft: Version 2 · less cream. Finish it in a wider window." (no record act, no button);
//   - the band does not scroll sideways at 393 or at 723 (extraWidths), 723 being the widest phone width.
// Panels (the "Drawn" ones; the three "As built" panels are not targets): band-tasted, band-awaiting,
// band-none and band-tasted-723 on the seed's own routes (the three standings, p12g2-capture.mjs), and
// band-editable on a recipe the steps make through the built editor at 1366
// (Coffee, "Strong and cold.": the creation editor, Save; then Edit with a description typed, or Next
// version with a version name typed, each kept for 1.3 s), the route then loaded again at the panel's own
// width so RecipePage mounts below 724 with the draft in the store.
//
// Two boards (quick 261123-brl, Mark's answer to decide-p12-desk-line-closing-words, 2026-11-23): the
// first five panels are held against recipe-head-below-724.html as before. band-editing and band-draft
// drew the superseded closing words, so they leave that board; the decided
// snapshot desk-line-words.html draws the same two states with the decided words as dl-head-edit and
// dl-head-draft, and the second spec holds them there with the same checks (line, buttons absent). The
// helpers the one-line page's Edit steps need (12-board-places.mjs), and ROUTES (the seed's three routes,
// which Home's held-draft steps there reuse), are exported. The board's words are Sid's or the
// seed's and are read from the panels by the engine, never retyped here; only the words typed into the
// built app (the recipe's name and description, the version name) are written here, as the board shows them.
//
// The anchor is the band (`.notebook-band`), measured like a crop: boxes from the band's top-left on both
// sides. The panels hold the whole shell, so the anchor keeps every check off the tab row and the page
// below the band.
//
//   S="${TMPDIR:-/tmp}/sprinkles-12"
//   npm --prefix app run build -- --outDir "$S/dist-16" --emptyOutDir
//   PROBE_DIST="$S/dist-16" node .planning/phases/12-*/12-board-check.mjs \
//     .planning/phases/12-*/12-board-band.mjs --selftest
//
// Every result is Playwright WebKit on a Mac: device-unverified.

const BOARD = '.planning/sketches/016-entry-points-pen-preview-row-controls/recipe-head-below-724.html';
const DECIDED_BOARD = '.planning/sketches/016-entry-points-pen-preview-row-controls/desk-line-words.html';

const WIN = (pid, width = 393) => `.fp-win.g2w-${width}[data-pid="${pid}"]`;

const SAVE_BUTTON = '.notebook-ceremony__actions .notebook-action:not(.notebook-action--outline)';
const NAME_FIELD = 'textarea[aria-label="Version name"]';
export const KEEP_MS = 1300;
export const DESK = { width: 1366, height: 1024 };

// The seed's own routes for the three standings (p12g2-capture.mjs's out.routes).
export const ROUTES = {
  tasted: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1',
  awaiting: '/notebook/mexican-chocolate/mexican-chocolate-v3',
  none: '/notebook/underbelly-light-base/underbelly-light-base-v2',
};

// A first version made and saved through the built editor at 1366, as p12g2-capture.mjs does. A first
// click on a fresh route can miss, so a click is repeated until its outcome shows.
export async function clickUntil(page, locator, selector) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await locator().first().click();
    try {
      await page.waitForSelector(selector, { timeout: 1500 });
      return;
    } catch {
      /* the click missed; click again */
    }
  }
  throw new Error(`never appeared: ${selector}`);
}

export async function visit(page, origin, route, selector) {
  await page.goto(origin + route, { waitUntil: 'load' });
  await page.waitForSelector(selector);
  await page.evaluate(() => document.fonts.ready);
}

async function addIngredient(page, name, grams) {
  await clickUntil(page, () => page.locator('.ingredient-table-region .mk-head-act'), '.pick');
  await page
    .locator('.pick__row', {
      has: page.locator('.pick__name', { hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }),
    })
    .click();
  await page.waitForSelector('.pick', { state: 'detached' });
  await page.fill(`[aria-label="${name}, grams"]`, grams);
}

// Coffee saved at 1366; returns the version's own address.
export async function makeCoffee(page, origin) {
  await visit(page, origin, '/notebook', '.nb__head');
  await clickUntil(page, () => page.locator('.nb__head .notebook-action'), '.nb__new textarea');
  await page.fill('.nb__new textarea', 'Coffee');
  await page.locator('.nb__new-actions button', { hasText: /^Start$/ }).click();
  await page.waitForSelector('.ingredient-table-region');
  await page.fill('textarea[aria-label="Recipe description"]', 'Strong and cold.');
  await addIngredient(page, 'Heavy cream, 36% fat', '400');
  await addIngredient(page, 'Coffee beans', '40');
  await clickUntil(page, () => page.locator('.method-region .mk-head-act'), '[aria-label="Step 1, lead-in"]');
  await page.fill('[aria-label="Step 1, lead-in"]', 'Steep');
  await page.fill('[aria-label="Step 1, instruction"]', 'Warm the cream with the beans, then strain.');
  await page.locator(SAVE_BUTTON).click();
  await page.waitForSelector('.notebook-version');
  const address = new URL(page.url()).pathname;
  if (!/^\/notebook\/[^/]+\/[^/]+$/.test(address)) throw new Error(`the page after Save is ${address}`);
  await page.evaluate(() => document.fonts.ready);
  return address;
}

// The panel's own steps: Coffee made at 1366, the kept work added there, then the version's route loaded
// again at the width the panel arrived at (393, or 723 for the extra width), so RecipePage mounts below 724
// with the kept draft in the store.
const keptSteps = (kept) => async (page) => {
  const origin = new URL(page.url()).origin;
  const arrived = page.viewportSize();
  await page.setViewportSize(DESK);
  const address = await makeCoffee(page, origin);
  if (kept === 'edit') {
    await visit(page, origin, address, '.notebook-version');
    await clickUntil(page, () => page.locator('.notebook-version__acts button', { hasText: /^Edit$/ }), '.ingredient-table-region');
    await page.fill('textarea[aria-label="Recipe description"]', 'Strong, cold and a little bitter.');
    await page.waitForTimeout(KEEP_MS);
  }
  if (kept === 'plan') {
    await visit(page, origin, address, '.notebook-version');
    await clickUntil(page, () => page.locator('.notebook-version__acts button', { hasText: /^Next version$/ }), 'form[aria-label="Next version"]');
    await page.fill(NAME_FIELD, 'less cream');
    await page.waitForTimeout(KEEP_MS);
  }
  await page.setViewportSize(arrived);
  await visit(page, origin, address, '.notebook-version');
  // The restore read settles (planGuard is true until it has) before anything is measured.
  await page.waitForTimeout(900);
};

// The band's parts every panel holds: the identity heading, the acts row (count, words, box), and the
// absence of every text control among the acts. The draft line is measured where the board draws one and
// declared absent where it draws none.
function bandPanel({ pid, width = 393, route, steps, line, buttonsAbsent }) {
  const panel = {
    id: pid,
    label: pid,
    width,
    panelSelector: WIN(pid, width),
    panelIndex: 0,
    route,
    library: 'current',
    ready: route === '/' ? '.shell' : '.notebook-version',
    anchor: '.notebook-band',
    elements: [
      { selector: 'h2.notebook-version__identity', checks: ['text', 'font', 'box'] },
      ...(line ? [{ selector: 'p.notebook-version__draft', checks: ['count', 'text', 'font', 'box'] }] : []),
      { selector: '.notebook-version__acts > *', checks: ['count', 'text', 'font', 'box'] },
    ],
    absent: [
      ...(line ? [] : ['p.notebook-version__draft']),
      '.notebook-version__acts button.notebook-link',
      ...(buttonsAbsent ? ['.notebook-version__acts button'] : []),
    ],
    overflow: true,
  };
  if (steps) panel.steps = steps;
  if (width === 393) panel.extraWidths = [723];
  return panel;
}

export default [
  {
    board: BOARD,
    panels: [
      bandPanel({ pid: 'band-tasted', route: ROUTES.tasted }),
      bandPanel({ pid: 'band-awaiting', route: ROUTES.awaiting }),
      bandPanel({ pid: 'band-none', route: ROUTES.none }),
      bandPanel({ pid: 'band-tasted-723', width: 723, route: ROUTES.tasted }),
      // The kept-work panels arrive at '/' and make their own state in steps (the version's address is
      // known only once it is saved), then load that address again at the panel's width.
      bandPanel({ pid: 'band-editable', route: '/', steps: keptSteps(null) }),
    ],
  },
  {
    board: DECIDED_BOARD,
    panels: [
      bandPanel({ pid: 'dl-head-edit', route: '/', steps: keptSteps('edit'), line: true, buttonsAbsent: true }),
      bandPanel({ pid: 'dl-head-draft', route: '/', steps: keptSteps('plan'), line: true, buttonsAbsent: true }),
    ],
  },
];
