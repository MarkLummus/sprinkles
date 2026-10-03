// Quick task 261002-vh5's probe: the record pen's wide-to-stacked cut moves to
// 724 (sketch 011 decision 28). Reads the built app (the checkout's app/dist)
// in Playwright's WebKit and in system Chrome, beside the three range boards
// (724-, 740- and 759-pen-range.html).
//
//   node 261002-vh5-probe.mjs [groups]
//
// `groups` is a comma list of: tracer, matrix, resize. No argument runs every
// group. Serves the build through the 03.5 harness's own ephemeral 127.0.0.1
// servers; never touches Mark's :4173 preview, :5173 or :8011, and starts no
// Vite process. Recording happens in throwaway browser contexts and nothing is
// saved. A reading here is evidence about two engines, not about Mark's iPad;
// the device is his to check.
import { webkit, devices } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import {
  startServers,
  launch,
  openApp,
  openBoard,
  APP_ROUTE,
  check,
  finish,
} from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const near = (a, b, tol) => a !== null && b !== null && a !== undefined && b !== undefined && Math.abs(a - b) <= tol;

// ---------------------------------------------------------------------------
// The capture state of the three range boards (plan Facts): Olive Oil v1 ->
// Record another -> Add tasting, with these values entered.
async function openPen(browser, appUrl, { width, coarse }) {
  let opened;
  try {
    opened = await openApp(browser, appUrl, APP_ROUTE, { width, coarse });
    const innerWidth = await opened.page.evaluate(() => window.innerWidth);
    if (innerWidth !== width) {
      await opened.context.close();
      throw new Error(`openPen: innerWidth ${innerWidth}, wanted ${width} (coarse=${coarse})`);
    }
  } catch (err) {
    if (!coarse || !String(err.message).startsWith('openPen: innerWidth')) throw err;
    // A coarse WebKit context that reports another innerWidth: build it from the
    // iPhone profile with viewport and screen pinned, as 261002-axn-probe does.
    const context = await browser.newContext({
      ...devices['iPhone 14'],
      viewport: { width, height: 1100 },
      screen: { width, height: 1100 },
    });
    await context.route('**/*', (route) => (new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort()));
    const page = await context.newPage();
    await page.goto(`${appUrl}${APP_ROUTE}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.notebook');
    const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
    if (state.coarse !== coarse || state.innerWidth !== width) {
      await context.close();
      throw new Error(`openPen: iPhone-profile fallback gave ${JSON.stringify(state)}, wanted coarse=${coarse} width=${width}`);
    }
    opened = { context, page };
    console.log(JSON.stringify({ note: 'iPhone-profile fallback context', width }));
  }

  const { context, page } = opened;
  await page.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click();
  await page.waitForSelector('.batch-margin--pen');
  const pen = page.locator('.batch-margin--pen');

  const fillField = async (label, value) => pen.getByLabel(label, { exact: true }).fill(value);
  const pickOption = async (value) => pen.locator(`.segmented__option:has(input[value="${value}"])`).first().click();

  await fillField('Time to draw temp., minutes', '12');
  await fillField('Out of machine, degrees Celsius', '-6');
  await fillField('Churn duration, minutes', '30');
  await fillField('At the machine', 'bowl frozen overnight');
  await fillField('Ingredient notes', 'oil bottle opened 24 Jul');
  await pickOption('Smooth ribbon');
  await pickOption('Medium, standard');

  const addTasting = page.locator('.batch-margin--pen button.save-ceremony__add-tasting');
  if ((await addTasting.count()) !== 1) throw new Error(`openPen: expected one Add tasting button, found ${await addTasting.count()}`);
  await addTasting.click();
  await page.waitForSelector('.batch-margin--pen .axis-mark__stops');

  const gridBefore = await page.evaluate(() => document.querySelector('.batch-margin--pen .axes-grid').getBoundingClientRect().height);

  await fillField('Tempering, minutes', '10');
  await fillField('Tasting temperature, degrees Celsius', '-12');
  await fillField('Melt test, g lost at 20 min', '3');
  await fillField('How did it turn out?', 'Soft, not greasy. The oil is strong.');
  await fillField('Next time', 'churn 2 min longer');
  for (const [name, stop] of [['hardness', 3], ['scoopability', 4], ['body', 5], ['smoothness', 4]]) {
    await pen.locator(`.axis-mark__stop:has(input[name="axis-${name}"][value="${stop}"])`).click();
  }
  await pickOption('Creamy puddle');
  await pen.getByRole('button', { name: 'Coarse, icy' }).click();
  await pen.getByRole('button', { name: 'Bitter' }).click();
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  return { context, page, gridBefore };
}

// Passed to page.evaluate, so the same code reads the app (root 'body') and a
// board panel (root '.rng-win.v-cut724-mouse', say).
function readPen(rootSelector) {
  const root = document.querySelector(rootSelector);
  const frameEl = root.querySelector('.batch-margin--pen');
  const frameRect = frameEl.getBoundingClientRect();
  const rel = (r) => ({ x: r.left - frameRect.left, y: r.top - frameRect.top, w: r.width, h: r.height });
  const gridEl = frameEl.querySelector('.axes-grid');
  const axes = [...frameEl.querySelectorAll('.axis-mark')].map((el) => {
    const r = el.getBoundingClientRect();
    const track = el.querySelector('.axis-mark__stops').getBoundingClientRect();
    const head = el.querySelector('.axis-mark__head');
    const stop = el.querySelector('.axis-mark__stop').getBoundingClientRect();
    return { ...rel(r), trackW: track.width, trackPast: track.right - r.right, headH: head ? head.getBoundingClientRect().height : null, stop: { w: stop.width, h: stop.height } };
  });
  const xs = [...new Set(axes.map((a) => Math.round(a.x * 2) / 2))];
  let overlapMax = 0;
  for (let i = 0; i < axes.length; i += 1) {
    for (let j = i + 1; j < axes.length; j += 1) {
      const a = axes[i];
      const b = axes[j];
      const ow = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oh = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ow > 0 && oh > 0) overlapMax = Math.max(overlapMax, Math.min(ow, oh));
    }
  }
  const clear = frameEl.querySelector('.axis-mark__clear');
  // frameOverflow is how far any real element's box overhangs the frame's side
  // edges. scrollOverflow is the frame's raw scrollWidth - clientWidth, which
  // also counts Clear's ::after hit area (right: -6px under the wide-touch
  // block, M4: "an overflowing hit area"). That 6px is drawn on the board and
  // is the same at 760 and up today, so it is read and compared, not hidden.
  let frameOverflow = 0;
  for (const el of frameEl.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    frameOverflow = Math.max(frameOverflow, r.right - frameRect.right, frameRect.left - r.left);
  }
  return {
    frame: { w: frameRect.width, h: frameRect.height },
    frameOverflow,
    scrollOverflow: frameEl.scrollWidth - frameEl.clientWidth,
    stacked: frameEl.querySelector('.axes-grid--stacked') !== null,
    rule: frameEl.querySelector('.axes-rule') !== null,
    grid: gridEl ? rel(gridEl.getBoundingClientRect()) : null,
    axes,
    columns: xs.length,
    overlapMax,
    trackPastMax: Math.max(...axes.map((a) => a.trackPast)),
    clearAfterH: clear ? getComputedStyle(clear, '::after').height : null,
    pageOverflow: rootSelector === 'body' ? document.documentElement.scrollWidth - document.documentElement.clientWidth : null,
  };
}

function expectArrangement(reading, { width, coarse }, label) {
  if (width < 724) {
    countedCheck(reading.stacked && !reading.rule, `${label}: stacked (stacked ${reading.stacked}, rule ${reading.rule})`);
    countedCheck(reading.axes.every((a) => near(a.trackW, 216, 0.5)), `${label}: every track 216 (${reading.axes.map((a) => a.trackW)})`);
    countedCheck(reading.axes.every((a) => near(a.stop.w, 44, 0.5) && near(a.stop.h, 44, 0.5)), `${label}: every stop 44 x 44 (${JSON.stringify(reading.axes.map((a) => a.stop))})`);
  } else {
    countedCheck(reading.rule && !reading.stacked, `${label}: three columns (rule ${reading.rule}, stacked ${reading.stacked})`);
    countedCheck(reading.columns === 3, `${label}: 3 columns (read ${reading.columns})`);
    countedCheck(reading.axes.every((a) => near(a.trackW, 186, 0.5)), `${label}: every track 186 (${reading.axes.map((a) => a.trackW)})`);
    const stopH = coarse ? 44 : 32;
    countedCheck(reading.axes.every((a) => near(a.stop.w, 38, 0.5) && near(a.stop.h, stopH, 0.5)), `${label}: every stop 38 x ${stopH} (${JSON.stringify(reading.axes.map((a) => a.stop))})`);
  }
  countedCheck(near(reading.frame.w, 640, 0.5), `${label}: frame width 640 (read ${reading.frame.w})`);
  countedCheck(reading.frameOverflow <= 0.5, `${label}: frame overflow ${reading.frameOverflow}`);
  if (!(coarse && width >= 724)) countedCheck(reading.scrollOverflow <= 0.5, `${label}: frame scroll overflow ${reading.scrollOverflow}`);
  countedCheck(reading.trackPastMax <= 0.5, `${label}: track past axis ${reading.trackPastMax}`);
  countedCheck(reading.overlapMax <= 0.5, `${label}: axis overlap ${reading.overlapMax}`);
  countedCheck(reading.pageOverflow === null || reading.pageOverflow <= 0.5, `${label}: page overflow ${reading.pageOverflow}`);
}

// Returns the largest difference it found, for the log line.
function compareToBoard(app, board, label) {
  let worst = 0;
  const cmp = (a, b, what) => {
    const d = Math.abs(a - b);
    worst = Math.max(worst, d);
    countedCheck(d <= 1, `${label}: ${what} ${a} vs board ${b}`);
  };
  cmp(app.frame.w, board.frame.w, 'frame width');
  cmp(app.frame.h, board.frame.h, 'frame height');
  cmp(app.scrollOverflow, board.scrollOverflow, 'frame scroll overflow');
  countedCheck(app.axes.length === board.axes.length, `${label}: axis count ${app.axes.length} vs board ${board.axes.length}`);
  for (const key of ['x', 'y', 'w', 'h']) cmp(app.grid[key], board.grid[key], `grid ${key}`);
  app.axes.forEach((a, i) => {
    const b = board.axes[i];
    if (!b) return;
    for (const key of ['x', 'y', 'w', 'h', 'trackW', 'headH']) cmp(a[key], b[key], `axis ${i} ${key}`);
    cmp(a.stop.w, b.stop.w, `axis ${i} first stop width`);
    cmp(a.stop.h, b.stop.h, `axis ${i} first stop height`);
  });
  return worst;
}

const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

// ---------------------------------------------------------------------------
// Groups.
async function tracer(browser, servers, engine) {
  // 740 with a mouse: three columns, matched to the board's v-cut724-mouse.
  const at740 = await openPen(browser, servers.appUrl, { width: 740, coarse: false });
  const app740 = await at740.page.evaluate(readPen, 'body');
  await at740.context.close();
  expectArrangement(app740, { width: 740, coarse: false }, `${engine} 740 mouse`);
  const b = await openBoard(browser, servers.repoUrl, '740-pen-range.html');
  const board740 = await b.page.evaluate(readPen, '.rng-win.v-cut724-mouse');
  await b.context.close();
  const worst = compareToBoard(app740, board740, `${engine} 740 mouse vs 740-pen-range.html v-cut724-mouse`);

  // 723 with a mouse: stacked.
  const at723 = await openPen(browser, servers.appUrl, { width: 723, coarse: false });
  const app723 = await at723.page.evaluate(readPen, 'body');
  await at723.context.close();
  expectArrangement(app723, { width: 723, coarse: false }, `${engine} 723 mouse`);

  console.log(JSON.stringify({
    engine,
    group: 'tracer',
    frameHeight740: app740.frame.h,
    boardFrameHeight740: board740.frame.h,
    maxBoardDiff740: worst,
    track740: app740.axes.map((a) => a.trackW),
    stop740: app740.axes[0].stop,
    frameHeight723: app723.frame.h,
    track723: app723.axes.map((a) => a.trackW),
    stop723: app723.axes[0].stop,
  }));
}

// Frame heights decision 28's addendum logged for 724-759, by engine and pointer.
const ADDENDUM_HEIGHT = { webkit: { mouse: 1209, touch: 1443 }, chrome: { mouse: 1200, touch: 1440 } };

const matrixLines = [];
const boardReadings = new Map();
async function boardReading(browser, servers, engine, width, panel) {
  const key = `${engine}/${width}`;
  if (!boardReadings.has(key)) {
    const b = await openBoard(browser, servers.repoUrl, `${width}-pen-range.html`);
    const reading = {};
    for (const name of ['v-cut724-mouse', 'v-cut724-touch']) {
      reading[name] = await b.page.evaluate(readPen, `.rng-win.${name}`);
    }
    await b.context.close();
    boardReadings.set(key, reading);
  }
  return boardReadings.get(key)[panel];
}

async function matrix(browser, servers, engine) {
  for (const width of [723, 724, 740, 759]) {
    for (const coarse of [false, true]) {
      const pointer = coarse ? 'touch' : 'mouse';
      const label = `${engine} ${width} ${pointer}`;
      const opened = await openPen(browser, servers.appUrl, { width, coarse });
      const app = await opened.page.evaluate(readPen, 'body');
      const gridAfter = app.grid.h;
      await opened.context.close();
      expectArrangement(app, { width, coarse }, label);

      let boardHeight = null;
      let worst = null;
      if (width >= 724) {
        const board = await boardReading(browser, servers, engine, width, `v-cut724-${pointer}`);
        boardHeight = board.frame.h;
        worst = compareToBoard(app, board, `${label} vs ${width}-pen-range.html v-cut724-${pointer}`);
        if (coarse) {
          countedCheck(app.axes.every((a) => near(a.headH, 28.8, 0.5)), `${label}: every caption line 28.8 (${app.axes.map((a) => a.headH)})`);
          countedCheck(app.clearAfterH === '44px', `${label}: Clear's ::after hit area 44px (read ${app.clearAfterH})`);
          countedCheck(near(gridAfter, opened.gridBefore, 0.5), `${label}: picking stops leaves the axes grid at ${opened.gridBefore} (read ${gridAfter})`);
        }
      } else if (coarse) {
        countedCheck(app.axes.every((a) => near(a.headH, 44, 0.5)), `${label}: every caption line 44 (${app.axes.map((a) => a.headH)})`);
      }

      const addendum = width >= 724 ? ADDENDUM_HEIGHT[engine][pointer] : null;
      matrixLines.push({
        engine,
        width,
        pointer,
        arrangement: app.stacked ? 'stacked' : `${app.columns} columns`,
        track: [...new Set(app.axes.map((a) => a.trackW))].join('/'),
        stop: `${app.axes[0].stop.w}x${app.axes[0].stop.h}`,
        frameW: app.frame.w,
        frameH: Math.round(app.frame.h * 100) / 100,
        boardFrameH: boardHeight === null ? null : Math.round(boardHeight * 100) / 100,
        maxBoardDiff: worst === null ? null : Math.round(worst * 100) / 100,
        addendumH: addendum,
        vsAddendum: addendum === null ? null : Math.round((app.frame.h - addendum) * 100) / 100,
        headH: coarse ? [...new Set(app.axes.map((a) => Math.round(a.headH * 10) / 10))].join('/') : null,
        clearAfterH: app.clearAfterH,
        overflow: { frame: app.frameOverflow, scroll: app.scrollOverflow, trackPast: app.trackPastMax, overlap: app.overlapMax, page: app.pageOverflow },
      });
      console.log(JSON.stringify({ group: 'matrix', ...matrixLines[matrixLines.length - 1] }));
    }
  }
}

// A live resize across the cut: the hook's listener and the CSS switch together.
async function resize(browser, servers, engine) {
  const { context, page } = await openPen(browser, servers.appUrl, { width: 740, coarse: false });
  const read = () => page.evaluate(readPen, 'body');
  expectArrangement(await read(), { width: 740, coarse: false }, `${engine} resize 740`);

  await page.setViewportSize({ width: 723, height: 1100 });
  await page.waitForSelector('.batch-margin--pen .axes-grid--stacked', { timeout: 3000 });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expectArrangement(await read(), { width: 723, coarse: false }, `${engine} resize 740 -> 723`);

  await page.setViewportSize({ width: 724, height: 1100 });
  await page.waitForSelector('.batch-margin--pen .axes-rule', { timeout: 3000 });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  expectArrangement(await read(), { width: 724, coarse: false }, `${engine} resize 723 -> 724`);
  await context.close();
  console.log(JSON.stringify({ engine, group: 'resize', switched: 'ok' }));
}

// ---------------------------------------------------------------------------
const requested = process.argv[2] ? process.argv[2].split(',') : ['tracer', 'matrix', 'resize'];
const servers = await startServers();
try {
  for (const [engine, make] of engines) {
    // The tracer proves one path in WebKit only; the other groups run both.
    if (requested.length === 1 && requested[0] === 'tracer' && engine !== 'webkit') continue;
    const browser = await make();
    try {
      if (requested.includes('tracer') && (engine === 'webkit' || requested.length > 1)) await tracer(browser, servers, engine);
      if (requested.includes('matrix')) await matrix(browser, servers, engine);
      if (requested.includes('resize')) await resize(browser, servers, engine);
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}

const over15 = matrixLines.filter((l) => l.vsAddendum !== null && Math.abs(l.vsAddendum) > 15);
if (over15.length > 0) console.log(`NOTE frame heights more than 15px from the addendum: ${JSON.stringify(over15.map((l) => [l.engine, l.width, l.pointer, l.frameH, l.addendumH]))}`);
finish(failures, count, '261002-vh5 probe');
