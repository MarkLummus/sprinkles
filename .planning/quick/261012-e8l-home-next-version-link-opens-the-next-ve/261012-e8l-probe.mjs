// Quick 261012-e8l: one tap on Home's Next version opens the Next version pen, in WebKit.
//
// Usage (from the repo root, after a build into a scratch directory):
//   npm --prefix app run build -- --outDir /path/to/scratch --emptyOutDir
//   PROBE_DIST=/path/to/scratch node .planning/quick/261012-e8l-.../261012-e8l-probe.mjs
//
// PROBE_DIST is required: the probe never serves app/dist and never contacts
// port 4173, so Mark's own `vite preview` is never disturbed.
//
// WebKit is the engine behind the iPad; a pass here is Playwright's build on a
// Mac, not Mobile Safari. Each viewport gets a fresh context (fresh IndexedDB),
// so the app seeds itself. Every request to another host is aborted. Everything
// labelled here is English.
//
// Prints FAIL lines (and exits 1) for a failure; other lines are information.
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const DIST = process.env.PROBE_DIST;
if (!DIST) {
  console.error('Usage: PROBE_DIST=/path/to/scratch/build node 261012-e8l-probe.mjs');
  process.exit(1);
}

const RECIPE_NAME = 'Olive Oil Ice Cream';
const EXPECTED_PATH = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';
const PEN = 'form[aria-label="Next version"]';

const VIEWPORTS = [
  { name: '1366 coarse', width: 1366, height: 1024 },
  { name: '393 coarse', width: 393, height: 852 },
];

const state = { failures: [], count: 0 };
function ok(condition, label) {
  state.count += 1;
  check(state.failures, condition, label);
}
const note = (text) => console.log(`NOTE ${text}`);

async function walk(browser, appUrl, { name, width, height }) {
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  });
  await context.route('**/*', (r) => {
    if (new URL(r.request().url()).hostname === '127.0.0.1') r.continue();
    else r.abort();
  });
  const page = await context.newPage();
  page.on('dialog', async (dialog) => {
    ok(false, `${name}: no dialog appears (saw "${dialog.message()}")`);
    await dialog.dismiss();
  });
  try {
    await page.goto(appUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.home__list');

    // The row: Olive Oil Ice Cream if it is Tasted, else the first Tasted row.
    const rows = page.locator('li.home__row');
    let row = rows.filter({ hasText: RECIPE_NAME }).first();
    let standing = (await row.locator('.home__standing').textContent())?.trim();
    ok(standing === 'Tasted', `${name}: ${RECIPE_NAME} reads Tasted (${standing})`);
    if (standing !== 'Tasted') {
      row = rows.filter({ has: page.locator('.home__standing', { hasText: /^Tasted$/ }) }).first();
      note(`${name}: ${RECIPE_NAME} was not Tasted; using the first Tasted row instead`);
    }

    const link = row.getByRole('link', { name: 'Next version', exact: true });
    const href = await link.getAttribute('href');
    ok(href === EXPECTED_PATH, `${name}: Next version href is the latest version path (${href})`);

    // One tap. A first input on a fresh page can miss: re-tap at most 3 more
    // times, and only while the URL is still Home.
    let taps = 0;
    for (let i = 0; i < 4; i += 1) {
      await link.tap();
      taps += 1;
      await page.waitForTimeout(1500);
      if (new URL(page.url()).pathname !== '/') break;
    }
    if (taps > 1) note(`${name}: the first tap missed; ${taps} taps in all`);
    ok(new URL(page.url()).pathname === EXPECTED_PATH, `${name}: tap lands on ${EXPECTED_PATH} (${new URL(page.url()).pathname})`);

    let penOpen = true;
    try {
      await page.waitForSelector(PEN, { timeout: 5000 });
    } catch {
      penOpen = false;
    }
    ok(penOpen, `${name}: pen open after one tap`);
    if (penOpen) {
      ok((await page.locator(PEN).count()) === 1, `${name}: exactly one Next version pen`);
      const title = await page.locator('[aria-label="Sheet title"]').inputValue();
      ok(title.trim().length > 0, `${name}: Sheet title is copied from the version`);
      const label = await page.locator('input[aria-label="Version name"]').inputValue();
      ok(label === '', `${name}: Version name is blank`);
    }
    const usr = await page.evaluate(() => window.history.state?.usr ?? null);
    ok(usr === null, `${name}: history state.usr is null after the pen opens (${JSON.stringify(usr)})`);

    // Back to Home.
    await page.goBack();
    await page.waitForSelector('.home__list');
    ok((await page.locator('.notebook').count()) === 0, `${name}: Back shows Home`);

    // Forward: the version page in reading, with no pen after a settle.
    await page.goForward();
    await page.waitForSelector('.notebook-version__acts');
    await page.waitForTimeout(1000);
    ok((await page.locator(PEN).count()) === 0, `${name}: Forward shows no pen`);

    // Reload: the same.
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('.notebook-version__acts');
    await page.waitForTimeout(1000);
    ok((await page.locator(PEN).count()) === 0, `${name}: reload shows no pen`);
  } finally {
    await context.close();
  }
}

const { appUrl, close } = await startServers({ appRoot: DIST });
const browser = await webkit.launch();
try {
  for (const viewport of VIEWPORTS) await walk(browser, appUrl, viewport);
} catch (error) {
  state.count += 1;
  state.failures.push(`FAIL probe threw: ${error.message}`);
} finally {
  await browser.close();
  await close();
}
finish(state.failures, state.count, '261012-e8l probe');
