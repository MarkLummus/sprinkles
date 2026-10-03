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
  openBoard,
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
// The matrix.
const BOARD_TASTING = {
  tastedDate: '2026-08-04',
  tempering: '10',
  tastingTemp: '-12',
  note: 'Soft, not greasy. The oil is strong.',
  nextTime: 'churn 2 min longer',
  marks: [['hardness', 3], ['scoopability', 4], ['smoothness', 5], ['sweetness', 4]],
  melt: '3',
  meltStyle: 'Creamy puddle',
  chips: ['Coarse, icy', 'Bitter'],
};

async function fillBoardTasting(page) {
  const pen = page.locator('.batch-margin--pen');
  await pen.locator('label:has(.pen-caption:text-is("Tasted")) input').fill(BOARD_TASTING.tastedDate);
  await fillIn(pen, 'Tempering, minutes', BOARD_TASTING.tempering);
  await fillIn(pen, 'Tasting temperature, degrees Celsius', BOARD_TASTING.tastingTemp);
  await fillIn(pen, 'How did it turn out?', BOARD_TASTING.note);
  await fillIn(pen, 'Next time', BOARD_TASTING.nextTime);
  for (const [name, stop] of BOARD_TASTING.marks) {
    await pen.locator(`.axis-mark__stop:has(input[name="axis-${name}"][value="${stop}"])`).click();
  }
  await fillIn(pen, 'Melt test, g lost at 20 min', BOARD_TASTING.melt);
  await pickOption(pen, BOARD_TASTING.meltStyle);
  for (const chip of BOARD_TASTING.chips) await pen.getByRole('button', { name: chip, exact: true }).click();
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

// Passed to page.evaluate: every descendant of the pen frame with a box, in
// DOM order, relative to the frame's top-left, plus the skin readings.
function readPenFrame() {
  const frameEl = document.querySelector('.batch-margin--pen');
  const frameRect = frameEl.getBoundingClientRect();
  const boxes = [];
  for (const el of frameEl.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    boxes.push({
      key: `${el.tagName.toLowerCase()}.${String(el.getAttribute('class') ?? '')}`,
      x: r.left - frameRect.left,
      y: r.top - frameRect.top,
      w: r.width,
      h: r.height,
    });
  }
  const stop = frameEl.querySelector('.axis-mark__stop:has(input:checked)');
  const field = frameEl.querySelector('.ink-field');
  return {
    frame: { w: frameRect.width, h: frameRect.height },
    boxes,
    stopBg: stop ? getComputedStyle(stop).backgroundColor : null,
    stopInnerBg: stop ? getComputedStyle(stop.querySelector('span') ?? stop).backgroundColor : null,
    fieldRadius: field ? getComputedStyle(field).borderRadius : null,
  };
}

function compareFrames(app, board, label) {
  const tol = 1;
  const mismatches = [];
  let worst = 0;
  const dw = Math.abs(app.frame.w - board.frame.w);
  const dh = Math.abs(app.frame.h - board.frame.h);
  worst = Math.max(worst, dw, dh);
  countedCheck(dw <= tol, `${label}: frame width ${app.frame.w} vs board ${board.frame.w}`);
  countedCheck(dh <= tol, `${label}: frame height ${app.frame.h} vs board ${board.frame.h}`);
  countedCheck(app.boxes.length === board.boxes.length, `${label}: element count ${app.boxes.length} vs board ${board.boxes.length}`);
  const n = Math.min(app.boxes.length, board.boxes.length);
  let keyMismatch = 0;
  for (let i = 0; i < n; i += 1) {
    const a = app.boxes[i];
    const b = board.boxes[i];
    if (a.key !== b.key) {
      keyMismatch += 1;
      if (mismatches.length < 10) mismatches.push(`#${i} key ${a.key} vs ${b.key}`);
      continue;
    }
    for (const k of ['x', 'y', 'w', 'h']) {
      const d = Math.abs(a[k] - b[k]);
      worst = Math.max(worst, d);
      if (d > tol && mismatches.length < 10) mismatches.push(`#${i} ${a.key} ${k} ${a[k].toFixed(2)} vs ${b[k].toFixed(2)}`);
    }
  }
  countedCheck(keyMismatch === 0, `${label}: tag.class sequence equal (${keyMismatch} differ)`);
  const off = mismatches.length;
  countedCheck(off === 0, `${label}: every box within ${tol}px${off ? ` (first mismatches: ${mismatches.join('; ')})` : ''}`);
  return { worst, mismatches, count: app.boxes.length };
}

async function matrixA(browser, servers, engine) {
  const { context, page } = await openAppPage(browser, servers.appUrl, OLIVE, W393);
  const label = `${engine} (a) 393c board case`;
  try {
    const id = await prepareAwaiting(page, BOARD_CHURN);
    await bandTasting(page).click();
    await page.waitForSelector('.batch-margin--pen');
    await settle(page);
    const opened = await activeInfo(page);
    countedCheck(opened?.isTastedDate === true && opened?.inViewport === true, `${label}: opens on the Tasted date, in view`);
    countedCheck((await page.getByRole('button', { name: 'Correct', exact: true }).count()) === 0, `${label}: no Correct while the pen is open`);
    await fillBoardTasting(page);
    await settle(page);
    const app = await page.evaluate(readPenFrame);

    const b = await openBoard(browser, servers.repoUrl, '393-pen-app.html');
    const board = await b.page.evaluate(readPenFrame);
    await b.context.close();
    const cmp = compareFrames(app, board, `${label} vs 393-pen-app.html`);
    console.log(JSON.stringify({ engine, case: 'a', frame: app.frame, boardFrame: board.frame, elements: cmp.count, worst: Math.round(cmp.worst * 100) / 100, mismatches: cmp.mismatches, app: { stopBg: app.stopBg, stopInnerBg: app.stopInnerBg, fieldRadius: app.fieldRadius }, board: { stopBg: board.stopBg, stopInnerBg: board.stopInnerBg, fieldRadius: board.fieldRadius } }));

    await page.locator('.batch-margin--pen').getByRole('button', { name: 'Save batch' }).first().click();
    await page.waitForSelector('.batch-margin--pen', { state: 'detached' });
    await settle(page);
    countedCheck((await page.locator('.batch-margin--pen').count()) === 0, `${label}: Save closes the pen`);
    const landed = await activeInfo(page);
    countedCheck(landed?.tag === 'H2' && landed?.id === 'batch', `${label}: focus lands on the log's Batch heading (${JSON.stringify(landed)})`);
    countedCheck(landed?.inViewport === true, `${label}: the Batch heading is in view`);
    countedCheck((await page.getByText('This batch has not been tasted yet.').count()) === 0, `${label}: the read view no longer says the batch awaits tasting`);
    const status = await page.locator('.page-status').first().innerText().catch(() => '');
    countedCheck(/^recorded .* against /.test(status.trim()), `${label}: page status reads "${status.trim()}"`);
    countedCheck((await page.locator('.notebook-band').getByRole('button', { name: 'Record another', exact: true }).count()) === 1, `${label}: the band's filled action reads Record another`);
    const stored = await readStoredBatch(page, id);
    countedCheck(stored?.tasting?.tastedDate === '2026-08-04' && stored?.tasting?.tastingTempC === -12 && stored?.churn?.churnDate === '2026-08-02', `${label}: the stored batch holds the tasting and the same churn date`);
    console.log(JSON.stringify({ engine, case: 'a', status: status.trim(), changed: stored?.changed ?? null }));
  } finally {
    await context.close();
  }
}

async function matrixB(browser, servers, engine) {
  const { context, page } = await openAppPage(browser, servers.appUrl, OLIVE, W393);
  const label = `${engine} (b) 393c Escape`;
  try {
    await prepareAwaiting(page, { churnDate: '2026-08-02' });
    await bandTasting(page).click();
    await page.waitForSelector('.batch-margin--pen');
    await settle(page);
    await page.keyboard.press('Escape');
    await settle(page);
    countedCheck((await page.locator('.batch-margin--pen').count()) === 0, `${label}: Escape closes an untouched pen`);
    const back = await activeInfo(page);
    countedCheck(back?.inBand === true && back?.text === 'Record a tasting' && back?.inViewport === true, `${label}: focus is on the band's Record a tasting, in view (${JSON.stringify(back)})`);
    await bandTasting(page).click();
    await page.waitForSelector('.batch-margin--pen');
    await fillIn(page.locator('.batch-margin--pen'), 'How did it turn out?', 'Soft');
    await page.keyboard.press('Escape');
    await settle(page);
    countedCheck((await page.locator('.batch-margin--pen').count()) === 1, `${label}: Escape leaves a typed pen open`);
  } finally {
    await context.close();
  }
}

async function matrixC(browser, servers, engine) {
  const { context, page } = await openAppPage(browser, servers.appUrl, OLIVE, { width: 723, height: 1024, coarse: false });
  const label = `${engine} (c) 723f`;
  try {
    await prepareAwaiting(page, { churnDate: '2026-08-02' });
    await bandTasting(page).click();
    await page.waitForSelector('.batch-margin--pen');
    await settle(page);
    const opened = await activeInfo(page);
    countedCheck(opened?.isTastedDate === true, `${label}: Tasting is open and the Tasted date is focused (${JSON.stringify(opened)})`);
    await page.locator('.batch-margin--pen').getByRole('button', { name: 'Cancel' }).first().click();
    await settle(page);
    const back = await activeInfo(page);
    countedCheck(back?.inBand === true && back?.text === 'Record a tasting', `${label}: Cancel returns focus to the band's Record a tasting (${JSON.stringify(back)})`);
  } finally {
    await context.close();
  }
}

async function matrixD(browser, servers, engine) {
  const { context, page } = await openAppPage(browser, servers.appUrl, OLIVE, { width: 1366, height: 1024, coarse: false });
  const label = `${engine} (d) 1366f`;
  try {
    await prepareAwaiting(page, { churnDate: '2026-08-02' });
    countedCheck((await page.getByRole('button', { name: 'Record a tasting' }).count()) === 0, `${label}: no Record a tasting button anywhere`);
    await page.getByRole('button', { name: 'Correct', exact: true }).click();
    await page.waitForSelector('.batch-margin--pen');
    await settle(page);
    const pen = page.locator('.batch-margin--pen');
    countedCheck((await pen.locator('.save-ceremony__add-tasting').count()) === 1, `${label}: Correct's pen offers Add tasting`);
    countedCheck((await pen.locator('h3.region-name', { hasText: /^Tasting$/ }).count()) === 0, `${label}: Correct's pen has no Tasting section`);
    await pen.getByRole('button', { name: 'Cancel' }).first().click();
    await settle(page);
    const back = await activeInfo(page);
    countedCheck(back?.className.includes('batch-row__correct') === true, `${label}: Cancel returns focus to Correct (${JSON.stringify(back)})`);
  } finally {
    await context.close();
  }
}

async function matrixE(browser, servers, engine) {
  const { context, page } = await openAppPage(browser, servers.appUrl, '/notebook/coconut/coconut-v2', W393);
  const label = `${engine} (e) 393c Coconut v2`;
  try {
    await bandTasting(page).click();
    await page.waitForSelector('.batch-margin--pen');
    await settle(page);
    const pen = page.locator('.batch-margin--pen');
    const opened = await activeInfo(page);
    countedCheck(opened?.isTastedDate === true, `${label}: opens on the Tasted date`);
    await fillIn(pen, 'Tasting temperature, degrees Celsius', '-12');
    await pen.getByRole('button', { name: 'Save batch' }).first().click();
    await settle(page);
    const after = await activeInfo(page);
    const text = await pen.innerText();
    const refused = text.includes('Enter the date you churned.');
    countedCheck(refused, `${label}: Save is refused with "Enter the date you churned."`);
    countedCheck(after?.isChurnDate === true, `${label}: focus moves to the Churn date (${JSON.stringify(after)})`);
    console.log(JSON.stringify({ engine, case: 'e', refused, focusOnChurnDate: after?.isChurnDate === true, stillOpen: (await page.locator('.batch-margin--pen').count()) === 1 }));
  } finally {
    await context.close();
  }
}

async function matrixF(browser, servers, engine) {
  const { context, page } = await openAppPage(browser, servers.appUrl, OLIVE, W393);
  const label = `${engine} (f) 393c older batch`;
  try {
    const id = await prepareAwaiting(page, { churnDate: '2026-08-09' });
    const oldPath = `${OLIVE}/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89`;
    await page.goto(servers.appUrl + oldPath, { waitUntil: 'networkidle' });
    await page.waitForSelector('.notebook');
    await page.waitForSelector('h2.notebook-version__identity');
    await settle(page);
    countedCheck((await page.locator('.batch-row__date').first().innerText()) === 'churned 2 Aug 2026', `${label}: the log shows the older batch`);
    await bandTasting(page).click();
    await page.waitForURL(`**/batch/${id}`);
    await page.waitForSelector('.batch-margin--pen');
    await settle(page);
    countedCheck(page.url().endsWith(`/batch/${id}`), `${label}: the URL is the awaiting batch's address`);
    const opened = await activeInfo(page);
    countedCheck(opened?.isTastedDate === true && opened?.inViewport === true, `${label}: the pen opens there on the Tasted date, in view`);
    countedCheck((await page.locator('.batch-row__date').first().innerText()) === 'churned 9 Aug 2026', `${label}: the head names the awaiting batch`);
    await page.locator('.batch-margin--pen').getByRole('button', { name: 'Cancel' }).first().click();
    await settle(page);
    const back = await activeInfo(page);
    countedCheck(back?.inBand === true && back?.text === 'Record a tasting', `${label}: Cancel returns focus to the band control (${JSON.stringify(back)})`);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('h2.notebook-version__identity');
    await settle(page);
    countedCheck((await page.locator('.batch-margin--pen').count()) === 0, `${label}: a reload opens no pen`);
  } finally {
    await context.close();
  }
}

async function matrix(browser, servers, engine) {
  for (const run of [matrixA, matrixB, matrixC, matrixD, matrixE, matrixF]) await run(browser, servers, engine);
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
      if (requested.includes('matrix')) await matrix(browser, servers, engine);
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}

finish(failures, count, '261002-wn0 probe');
