// Quick task 261002-wn0's probe: below 724 the recipe band's Record a tasting
// opens the log's amend pen with the Tasting section already open (sketch 011
// decision 30, Mark's answer 1; 393-pen-app.html). Measures the BUILT app
// (app/dist) in Playwright's WebKit and system Chrome.
//
//   node 261002-wn0-probe.mjs tracer          (webkit, 393 coarse: open, focus, Cancel)
//   node 261002-wn0-probe.mjs matrix          (both engines: the cases a to f)
//   node 261002-wn0-probe.mjs tracer,matrix
//
// Serves the build and the repo through the 03.5 harness's own ephemeral
// 127.0.0.1 servers; never requests Mark's :4173 preview, :5173 or the sketch
// server on :8011, and starts no Vite process. Every non-127.0.0.1 request is
// aborted. Every save lands in a throwaway context's own IndexedDB. A reading
// here is evidence about two engines, not about Mark's iPhone or iPad; the
// device is his to check.
import { webkit, devices } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import {
  startServers,
  launch,
  check,
  finish,
} from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const OLIVE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1';

const W393 = { width: 393, height: 852, coarse: true };

const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

// ---------------------------------------------------------------------------
// Opening a page. A coarse context is built from the iPhone profile with
// viewport and screen pinned (the wmz probe's fallback), in both engines.
async function openAppPage(browser, appUrl, route, { width, height, coarse }) {
  const options = coarse
    ? { ...devices['iPhone 14'], viewport: { width, height }, screen: { width, height } }
    : { viewport: { width, height } };
  const context = await browser.newContext(options);
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('.notebook');
  await page.waitForSelector('h2.notebook-version__identity');
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== coarse || state.innerWidth !== width) {
    await context.close();
    throw new Error(`openAppPage: wanted coarse=${coarse} width=${width}, got ${JSON.stringify(state)} for ${route}`);
  }
  return { context, page };
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await page.waitForTimeout(250);
}

// The board's churn values (393-pen-app.html, from Olive Oil v1's capture).
const BOARD_CHURN = {
  churnDate: '2026-08-02',
  timeToDraw: '12',
  outOfMachine: '-6',
  churnDuration: '30',
  atTheMachine: 'bowl frozen overnight',
  ingredientNotes: 'oil bottle opened 24 Jul',
  exitConsistency: 'Smooth ribbon',
  airiness: 'Medium, standard',
};

const fillIn = (pen, label, value) => pen.getByLabel(label, { exact: true }).fill(value);
const pickOption = (pen, value) => pen.locator(`.segmented__option:has(input[value="${value}"])`).first().click();

// prepareAwaiting(page, values): from Olive Oil v1's own address, Record
// another, fill the churn values given (the Churn date at least), save, and
// return the new batch's id. The new batch is the latest and awaits tasting.
async function prepareAwaiting(page, values) {
  await page.locator('.batch-row__record').first().click();
  await page.waitForSelector('.batch-margin--pen');
  const pen = page.locator('.batch-margin--pen');
  await pen.getByLabel('Churn date').fill(values.churnDate);
  if (values.timeToDraw) await fillIn(pen, 'Time to draw temp., minutes', values.timeToDraw);
  if (values.outOfMachine) await fillIn(pen, 'Out of machine, degrees Celsius', values.outOfMachine);
  if (values.churnDuration) await fillIn(pen, 'Churn duration, minutes', values.churnDuration);
  if (values.atTheMachine) await fillIn(pen, 'At the machine', values.atTheMachine);
  if (values.ingredientNotes) await fillIn(pen, 'Ingredient notes', values.ingredientNotes);
  if (values.exitConsistency) await pickOption(pen, values.exitConsistency);
  if (values.airiness) await pickOption(pen, values.airiness);
  await pen.getByRole('button', { name: 'Save batch' }).first().click();
  await page.waitForURL(/\/batch\/[^/]+$/);
  await page.waitForSelector('h2.region-name:has-text("Batch")');
  await settle(page);
  return page.url().split('/batch/')[1];
}

async function readStoredBatch(page, id) {
  return page.evaluate(
    (batchId) =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open('sprinkles');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const get = open.result.transaction('batches').objectStore('batches').get(batchId);
          get.onsuccess = () => resolve(get.result ?? null);
          get.onerror = () => reject(get.error);
        };
      }),
    id,
  );
}

const bandTasting = (page) => page.locator('.notebook-band').getByRole('button', { name: 'Record a tasting', exact: true });

async function activeInfo(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      id: el.id,
      className: String(el.className),
      text: (el.textContent || '').trim().slice(0, 40),
      inBand: el.closest('.notebook-band') !== null,
      inPen: el.closest('.batch-margin--pen') !== null,
      isTastedDate: el.type === 'date' && (el.closest('label')?.querySelector('.pen-caption')?.textContent === 'Tasted'),
      isChurnDate: el.type === 'date' && (el.closest('label')?.querySelector('.pen-caption')?.textContent === 'Churn date'),
      top: r.top,
      bottom: r.bottom,
      innerHeight: window.innerHeight,
      inViewport: r.top >= 0 && r.bottom <= window.innerHeight,
    };
  });
}

// ---------------------------------------------------------------------------
// The tracer: one path through the thin slice, WebKit at 393 coarse.
async function tracer(browser, servers, engine) {
  const { context, page } = await openAppPage(browser, servers.appUrl, OLIVE, W393);
  try {
    const id = await prepareAwaiting(page, BOARD_CHURN);
    const band = bandTasting(page);
    countedCheck((await band.count()) === 1, `${engine} tracer: the band holds exactly one Record a tasting`);
    const scrollBefore = await page.evaluate(() => scrollY);
    await band.click();
    await page.waitForSelector('.batch-margin--pen');
    await settle(page);
    countedCheck((await page.locator('.batch-margin--pen h3.region-name', { hasText: /^Tasting$/ }).count()) === 1, `${engine} tracer: the pen holds the Tasting section`);
    const opened = await activeInfo(page);
    countedCheck(opened?.isTastedDate === true, `${engine} tracer: focus is on the Tasted date (${JSON.stringify(opened)})`);
    countedCheck(opened?.inViewport === true, `${engine} tracer: the Tasted date is inside the viewport (${opened?.top} to ${opened?.bottom} of ${opened?.innerHeight})`);
    countedCheck((await page.getByRole('button', { name: 'Correct', exact: true }).count()) === 0, `${engine} tracer: no button named Correct while the pen is open`);
    const head = await page.locator('.batch-row__date').first().innerText();
    countedCheck(head === 'churned 2 Aug 2026', `${engine} tracer: the head reads "${head}"`);

    const scrollOpen = await page.evaluate(() => scrollY);
    await page.locator('.batch-margin--pen').getByRole('button', { name: 'Cancel' }).first().click();
    await settle(page);
    console.log(JSON.stringify({ engine, scrollBefore, scrollOpen, scrollAfter: await page.evaluate(() => scrollY) }));
    countedCheck((await page.locator('.batch-margin--pen').count()) === 0, `${engine} tracer: Cancel closes the pen`);
    const back = await activeInfo(page);
    countedCheck(back?.inBand === true && back?.text === 'Record a tasting', `${engine} tracer: focus returns to the band's Record a tasting (${JSON.stringify(back)})`);
    countedCheck(back?.inViewport === true, `${engine} tracer: the band control is inside the viewport (${back?.top} to ${back?.bottom} of ${back?.innerHeight})`);
    const stored = await readStoredBatch(page, id);
    countedCheck(stored !== null && stored.tasting === null, `${engine} tracer: Cancel wrote no tasting`);
    console.log(JSON.stringify({ engine, group: 'tracer', opened, back }));
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
const requested = process.argv[2] ? process.argv[2].split(',') : ['tracer', 'matrix'];
const servers = await startServers();
try {
  for (const [engine, make] of engines) {
    // The tracer proves one path in WebKit only; the other groups run both.
    if (requested.length === 1 && requested[0] === 'tracer' && engine !== 'webkit') continue;
    const browser = await make();
    try {
      if (requested.includes('tracer') && (engine === 'webkit' || requested.length > 1)) await tracer(browser, servers, engine);
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}

finish(failures, count, '261002-wn0 probe');
