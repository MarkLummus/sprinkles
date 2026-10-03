// Quick task 261002-wn1's probe: below 724 the recipe's Show changes moves from
// the band to the right-aligned head row of the Ingredients region (sketch 011
// decision 30, addendum option 3, Mark 2026-10-02; boards
// 393-show-changes-head.html and 723-show-changes-head.html). Measures the BUILT
// app (app/dist) in Playwright's WebKit and system Chrome, before and after.
//
//   node 261002-wn1-probe.mjs baseline        (build of the unchanged source; writes the JSON)
//   node 261002-wn1-probe.mjs tracer          (webkit, 393 coarse, coconut-v2)
//   node 261002-wn1-probe.mjs matrix          (every cell vs the baseline, boards, keyboard, crossing, print)
//   node 261002-wn1-probe.mjs tracer,matrix
//
// Serves the build and the repo through the 03.5 harness's own ephemeral
// 127.0.0.1 servers; never requests Mark's :4173 preview, :5173 or the sketch
// server on :8011, and starts no Vite process. Every non-127.0.0.1 request is
// aborted, every pen is opened in a throwaway context and nothing is saved. A
// reading here is evidence about two engines, not about Mark's iPhone or iPad.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, devices } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261002-wn1-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const COCONUT_V1 = '/notebook/coconut/coconut-v1';
const COCONUT_V2 = '/notebook/coconut/coconut-v2';
const COCONUT_V2_BATCH = '/notebook/coconut/coconut-v2/batch/coconut-v2-batch-01';

const CHANGES_RE = /^(Show|Hide) changes$/;

// ---------------------------------------------------------------------------
// In-page reader (passed to page.evaluate). Rects are relative to the
// Ingredients region's top-left unless named otherwise. A display:none element
// reports a 0x0 rect at the origin, so only laid-out elements get a rect.
async function readPage() {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const region = document.querySelector('section.ingredient-table-region');
  const rg = region.getBoundingClientRect();
  const laidOut = (el) => getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0;
  const rel = (el) => {
    if (!laidOut(el)) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left - rg.left, y: r.top - rg.top, width: r.width, height: r.height, right: r.right - rg.left, bottom: r.bottom - rg.top };
  };
  const band = document.querySelector('header.notebook-band');
  const buttons = [...document.querySelectorAll('button')];

  const controls = buttons
    .filter((b) => /^(Show|Hide) changes$/.test(b.textContent.trim()))
    .map((b) => {
      const cs = getComputedStyle(b);
      return {
        label: b.textContent.trim(),
        where: band && band.contains(b) ? 'band' : b.closest('.ingredient-table-region__head') ? 'head' : 'other',
        display: cs.display,
        rect: rel(b),
        tabindex: b.getAttribute('tabindex'),
        ariaPressed: b.getAttribute('aria-pressed'),
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        textDecorationLine: cs.textDecorationLine,
      };
    });

  const nextVersion = band ? [...band.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Next version') : null;
  let acts = null;
  if (nextVersion) {
    const el = nextVersion.parentElement;
    const children = [...el.children].filter(laidOut).map((c) => ({ label: c.textContent.trim(), rect: rel(c) }));
    const tops = children.map((c) => c.rect.y);
    acts = {
      height: el.getBoundingClientRect().height,
      children,
      oneLine: tops.every((t) => Math.abs(t - tops[0]) <= 0.5),
    };
  }

  const heading = [...document.querySelectorAll('h2.region-name')].find((h) => h.textContent.trim() === 'Ingredients');
  const headEl = document.querySelector('.ingredient-table-region__head');
  const table = document.querySelector('.ingredient-table');
  const tableTop = table.getBoundingClientRect().top - rg.top;
  const headOrHeading = headEl || heading;
  return {
    innerWidth: window.innerWidth,
    pointerCoarse: matchMedia('(pointer: coarse)').matches,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    controls,
    acts,
    region: { width: rg.width, height: rg.height, overflowX: getComputedStyle(region).overflowX },
    heading: heading ? rel(heading) : null,
    head: headEl ? rel(headEl) : null,
    tableTop,
    tableDocTop: table.getBoundingClientRect().top + window.scrollY,
    gapToTable: headOrHeading ? tableTop - (headOrHeading.getBoundingClientRect().bottom - rg.top) : null,
    struck: table.querySelectorAll('.struck-value').length,
    hasChangesParam: new URLSearchParams(location.search).has('changes'),
    bandHasJump: band ? band.querySelector('a.notebook-jump') !== null : false,
    bandButtons: band ? [...band.querySelectorAll('button')].map((b) => b.textContent.trim()) : [],
  };
}

// ---------------------------------------------------------------------------
// Node-side helpers (openAppPage, openPen and openRecording follow
// 261002-wdn-probe.mjs).
async function openAppPage(browser, appUrl, route, { width, coarse }) {
  const options = coarse
    ? { ...devices['iPhone 14'], viewport: { width, height: 1100 }, screen: { width, height: 1100 } }
    : { viewport: { width, height: 1100 } };
  const context = await browser.newContext(options);
  await context.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await context.newPage();
  await page.goto(appUrl + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('.ingredient-table');
  await page.waitForSelector('h2.notebook-version__identity');
  const state = await page.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, innerWidth: window.innerWidth }));
  if (state.coarse !== coarse || state.innerWidth !== width) {
    await context.close();
    throw new Error(`openAppPage: wanted coarse=${coarse} width=${width}, got ${JSON.stringify(state)} for ${route}`);
  }
  return { context, page };
}

const changesButton = (page) => page.getByRole('button', { name: CHANGES_RE });
const roleCount = (page) => changesButton(page).count();

async function openPen(page) {
  await page.getByRole('button', { name: 'Next version' }).first().click();
  await page.getByLabel('Salt, grams', { exact: true }).waitFor();
}

async function openRecording(page) {
  await page.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click();
  await page.waitForSelector('.ingredient-table__as-made-field');
}

async function openTasting(page) {
  await page.locator('header.notebook-band').getByRole('button', { name: 'Record a tasting', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).first().waitFor({ state: 'visible' });
}

// Activates the one Show changes button, wherever it is, and reads the page;
// then activates Hide changes and records what is left.
async function showThenHide(page) {
  await page.getByRole('button', { name: 'Show changes', exact: true }).click();
  await page.getByRole('button', { name: 'Hide changes', exact: true }).waitFor();
  const read = await page.evaluate(readPage);
  read.roleCount = await roleCount(page);
  await page.getByRole('button', { name: 'Hide changes', exact: true }).click();
  await page.getByRole('button', { name: 'Show changes', exact: true }).waitFor();
  const after = await page.evaluate(readPage);
  read.struckAfterHide = after.struck;
  read.labelAfterHide = after.controls.map((c) => c.label);
  read.hasChangesParamAfterHide = after.hasChangesParam;
  return read;
}

const CASES = [
  { id: 'v2-reading', route: COCONUT_V2 },
  { id: 'v2-show-changes', route: COCONUT_V2, run: showThenHide },
  { id: 'v1-reading', route: COCONUT_V1 },
  { id: 'v2-pen', route: COCONUT_V2, prepare: openPen },
  { id: 'v2-record', route: COCONUT_V2_BATCH, prepare: openRecording },
  { id: 'v2-tasting', route: COCONUT_V2, prepare: openTasting, belowOnly: true },
];
const WIDTHS = [
  { width: 320, coarse: true },
  { width: 375, coarse: true },
  { width: 393, coarse: true },
  { width: 723, coarse: false },
  { width: 723, coarse: true },
  { width: 724, coarse: false },
  { width: 724, coarse: true },
  { width: 1366, coarse: false },
  { width: 1366, coarse: true },
];
const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

const pointer = (w) => (w.coarse ? 'coarse' : 'fine');
const cellKey = (engine, w, id) => `${engine}|${w.width}|${pointer(w)}|${id}`;
const round = (n) => (n === null || n === undefined ? n : Math.round(n * 100) / 100);

async function measure(browser, servers, w, c) {
  const { context, page } = await openAppPage(browser, servers.appUrl, c.route, w);
  try {
    if (c.prepare) await c.prepare(page);
    if (c.run) return await c.run(page);
    const read = await page.evaluate(readPage);
    read.roleCount = await roleCount(page);
    return read;
  } finally {
    await context.close();
  }
}

const near = (a, b, tol = 0.5) => a !== null && b !== null && a !== undefined && b !== undefined && Math.abs(a - b) <= tol;

// ---------------------------------------------------------------------------
async function runBaseline(servers) {
  const results = {};
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      for (const w of WIDTHS) {
        for (const c of CASES) {
          if (c.belowOnly && w.width >= 724) continue;
          const key = cellKey(engine, w, c.id);
          const read = await measure(browser, servers, w, c);
          results[key] = read;
          const label = key;
          // Blocking precondition: the band is what this plan assumes.
          if (c.id === 'v2-reading' && w.width === 393) {
            countedCheck(read.controls.length === 1 && read.controls[0].where === 'band', `${label}: exactly one Show changes, in the band (${JSON.stringify(read.controls.map((x) => x.where))})`);
            countedCheck(read.bandButtons.includes('Record a tasting'), `${label}: band holds Record a tasting (wmz landed): ${JSON.stringify(read.bandButtons)}`);
            countedCheck(read.bandHasJump, `${label}: band holds Go to batch (wmy landed)`);
          }
          if (c.id === 'v1-reading' || c.id === 'v2-pen' || c.id === 'v2-record' || c.id === 'v2-tasting') {
            countedCheck(read.controls.length === 0, `${label}: no Show/Hide changes control (read ${read.controls.length})`);
          }
          if (c.id === 'v2-show-changes') {
            countedCheck(read.struck > 0 && read.struckAfterHide === 0, `${label}: struck ${read.struck} above 0, after Hide ${read.struckAfterHide}`);
          }
          countedCheck(read.roleCount === read.controls.length, `${label}: role count ${read.roleCount} equals DOM count ${read.controls.length}`);
          if (c.id === 'v2-reading' && w.width <= 393) {
            // Decision 30 measured a wrap here; log, do not assert.
            console.log(JSON.stringify({ cell: key, actsOneLine: read.acts?.oneLine, actsHeight: round(read.acts?.height) }));
          }
        }
      }
    } finally {
      await browser.close();
    }
  }
  if (failures.length === 0) await writeFile(BASELINE_PATH, JSON.stringify(results, null, 2) + '\n');
}

async function runTracer(servers, baseline) {
  const browser = await webkit.launch();
  const w = { width: 393, coarse: true };
  const { context, page } = await openAppPage(browser, servers.appUrl, COCONUT_V2, w);
  try {
    const read = await page.evaluate(readPage);
    const rc = await roleCount(page);
    countedCheck(read.controls.length === 1 && read.controls[0].where === 'head', `tracer: one control, in the head (${JSON.stringify(read.controls.map((x) => x.where))})`);
    countedCheck(rc === 1, `tracer: role count ${rc} is 1`);
    countedCheck(read.head !== null && read.controls[0]?.rect && near(read.controls[0].rect.right, read.head.right), `tracer: control right ${read.controls[0]?.rect?.right} on head right ${read.head?.right}`);
    countedCheck(read.acts?.oneLine === true, `tracer: the band's acts sit on one line (height ${round(read.acts?.height)})`);
    const expected = baseline['webkit|393|coarse|v2-show-changes'].struck;
    await changesButton(page).click();
    await page.getByRole('button', { name: 'Hide changes', exact: true }).waitFor();
    const shown = await page.evaluate(readPage);
    countedCheck(shown.controls.length === 1 && shown.controls[0].label === 'Hide changes' && shown.controls[0].where === 'head', `tracer: Hide changes, still in the head`);
    countedCheck(shown.struck === expected && expected > 0, `tracer: struck ${shown.struck} equals baseline ${expected}`);
    await changesButton(page).click();
    await page.getByRole('button', { name: 'Show changes', exact: true }).waitFor();
    const hidden = await page.evaluate(readPage);
    countedCheck(hidden.controls[0]?.label === 'Show changes' && hidden.struck === 0, `tracer: Show changes again, struck ${hidden.struck}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

async function runMatrix() {
  throw new Error('matrix group is added in Task 3');
}

// ---------------------------------------------------------------------------
const groups = (process.argv[2] ?? '').split(',').filter(Boolean);
if (groups.length === 0 || !groups.every((g) => ['baseline', 'tracer', 'matrix'].includes(g))) {
  console.log('usage: node 261002-wn1-probe.mjs baseline|tracer|matrix[,...]');
  process.exit(2);
}
const servers = await startServers();
try {
  const baseline = groups.includes('baseline') ? null : JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
  for (const group of groups) {
    if (group === 'baseline') await runBaseline(servers);
    if (group === 'tracer') await runTracer(servers, baseline);
    if (group === 'matrix') await runMatrix(servers, baseline);
  }
} finally {
  await servers.close();
}
finish(failures, count, `261002-wn1 probe (${groups.join(',')})`);
