// Quick task 261002-wdn's probe: a lone "Unallocated" step head is hidden in the
// ingredient table (Mark, 2026-10-02, option 1). Measures the BUILT app
// (app/dist) in Playwright's WebKit and system Chrome, at 393 coarse and 1920
// fine, before and after the change.
//
//   node 261002-wdn-probe.mjs baseline   (build of the unchanged source; writes the JSON)
//   node 261002-wdn-probe.mjs tracer     (webkit, 1920, coconut-v2 reading vs the baseline)
//   node 261002-wdn-probe.mjs matrix     (every cell vs the baseline)
//
// Serves the build through the 03.5 harness's own ephemeral 127.0.0.1 servers;
// never requests Mark's :4173 preview, the dev server or the sketch server on
// :8011, and starts no Vite process. The pen and the record pen are opened in
// throwaway browser contexts and nothing is saved. A reading here is evidence
// about two engines, not about Mark's iPhone or iPad; the device is his to check.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, devices } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = path.join(HERE, '261002-wdn-baseline.json');

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const COCONUT_V1 = '/notebook/coconut/coconut-v1';
const COCONUT_V1_BATCH = '/notebook/coconut/coconut-v1/batch/coconut-v1-batch-01';
const COCONUT_V2 = '/notebook/coconut/coconut-v2';
const COCONUT_V2_BATCH = '/notebook/coconut/coconut-v2/batch/coconut-v2-batch-01';
const MEX4 = '/notebook/mexican-chocolate/mexican-chocolate-v4';

// ---------------------------------------------------------------------------
// In-page reader (passed to page.evaluate). textContent, not innerText: the
// head is uppercased by CSS. x is relative to the table's left edge, y to the
// row's top; heights and widths are raw.
async function readTable() {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const table = document.querySelector('.ingredient-table');
  const t = table.getBoundingClientRect();
  const norm = (s) => s.replace(/\s+/g, ' ').trim();

  const allTrs = [...table.querySelectorAll('tbody > tr')];
  const heads = allTrs
    .filter((tr) => tr.classList.contains('ingredient-table__step-head'))
    .map((tr) => ({ text: tr.textContent.trim(), height: tr.getBoundingClientRect().height }));
  const rowRecord = (tr) => {
    const r = tr.getBoundingClientRect();
    return {
      text: norm(tr.textContent),
      height: r.height,
      cells: [...tr.children].map((td) => {
        const b = td.getBoundingClientRect();
        return { x: b.left - t.left, y: b.top - r.top, width: b.width, height: b.height };
      }),
    };
  };
  const rows = allTrs.filter((tr) => !tr.classList.contains('ingredient-table__step-head')).map(rowRecord);
  const totalTr = table.querySelector('tfoot > tr');
  const thead = table.querySelector('thead');
  const theadVisible = thead && getComputedStyle(thead).display !== 'none';
  const firstTr = allTrs[0];
  const firstIngredientTr = allTrs.find((tr) => !tr.classList.contains('ingredient-table__step-head'));
  const heading = [...document.querySelectorAll('h2.region-name')].find((h) => h.textContent.trim() === 'Ingredients');
  const headingBottom = heading ? heading.getBoundingClientRect().bottom : null;
  return {
    innerWidth: window.innerWidth,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    table: { width: t.width, height: t.height },
    heads,
    rows,
    total: totalTr ? rowRecord(totalTr) : null,
    // First tbody row's top to the thead's bottom; the thead is display:none
    // at 393, so to the table's top there.
    firstTrTop: firstTr.getBoundingClientRect().top - (theadVisible ? thead.getBoundingClientRect().bottom : t.top),
    firstIngredientTop: firstIngredientTr.getBoundingClientRect().top - (theadVisible ? thead.getBoundingClientRect().bottom : t.top),
    headingToFirstTr: headingBottom === null ? null : firstTr.getBoundingClientRect().top - headingBottom,
    headingToFirstIngredient: headingBottom === null ? null : firstIngredientTr.getBoundingClientRect().top - headingBottom,
    struck: table.querySelectorAll('.struck-value').length,
    inputs: table.querySelectorAll('tbody input').length,
  };
}

// ---------------------------------------------------------------------------
// Node-side helpers (copied from 261002-axn-probe.mjs).
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

async function showChanges(page) {
  await page.getByRole('button', { name: 'Show changes' }).first().click();
  await page.getByRole('button', { name: 'Hide changes' }).first().waitFor();
}

// 'Next version' sits in the open reading header at both widths on these
// routes, so no FoldRow needs opening first.
async function openPen(page) {
  await page.getByRole('button', { name: 'Next version' }).first().click();
  await page.getByLabel('Salt, grams', { exact: true }).waitFor();
}

async function openRecording(page) {
  await page.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click();
  await page.waitForSelector('.ingredient-table__as-made-field');
}

const CASES = [
  { id: 'coconut-v1 reading', route: COCONUT_V1, coconut: true },
  { id: 'coconut-v1 batch', route: COCONUT_V1_BATCH, coconut: true },
  { id: 'coconut-v2 reading', route: COCONUT_V2, coconut: true },
  { id: 'coconut-v2 batch', route: COCONUT_V2_BATCH, coconut: true },
  { id: 'coconut-v2 show-changes', route: COCONUT_V2, coconut: true, prepare: showChanges, struck: true },
  { id: 'coconut-v2 pen', route: COCONUT_V2, coconut: true, prepare: openPen, inputs: true },
  { id: 'coconut-v2 recording', route: COCONUT_V2_BATCH, coconut: true, prepare: openRecording, inputs: true },
  { id: 'mexican-chocolate-v4 reading', route: MEX4, coconut: false },
  { id: 'mexican-chocolate-v4 show-changes', route: MEX4, coconut: false, prepare: showChanges, struck: true },
];
const WIDTHS = [
  { width: 393, coarse: true },
  { width: 1920, coarse: false },
];
const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

const cellKey = (engine, width, id) => `${engine}|${width}|${id}`;

async function measure(browser, servers, { width, coarse }, c) {
  const { context, page } = await openAppPage(browser, servers.appUrl, c.route, { width, coarse });
  try {
    if (c.prepare) await c.prepare(page);
    return await page.evaluate(readTable);
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
const near = (a, b, tol) => a !== null && b !== null && a !== undefined && b !== undefined && Math.abs(a - b) <= tol;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const round = (n) => (n === null ? null : Math.round(n * 100) / 100);

function sameRow(label, a, b) {
  countedCheck(a.text === b.text, `${label}: text "${a.text}" vs "${b.text}"`);
  countedCheck(near(a.height, b.height, 0.5), `${label}: height ${a.height} vs ${b.height}`);
  countedCheck(a.cells.length === b.cells.length, `${label}: cell count ${a.cells.length} vs ${b.cells.length}`);
  a.cells.forEach((cell, i) => {
    const bc = b.cells[i];
    if (!bc) return;
    // A display:none cell reports a 0x0 rect at the page origin, so its y
    // relative to the row only tracks where the row sits; compare y for
    // laid-out cells alone.
    const hidden = bc.width === 0 && bc.height === 0;
    countedCheck(
      near(cell.x, bc.x, 0.5) && (hidden || near(cell.y, bc.y, 0.5)) && near(cell.width, bc.width, 0.5) && near(cell.height, bc.height, 0.5),
      `${label} cell ${i}: ${JSON.stringify(cell)} vs ${JSON.stringify(bc)}`,
    );
  });
}

function compareCell(label, c, after, before) {
  // Heads.
  if (c.coconut) {
    countedCheck(after.heads.length === 0, `${label}: ${after.heads.length} step heads (want 0)`);
    countedCheck(!JSON.stringify(after).includes('Unallocated'), `${label}: 'Unallocated' text remains`);
  } else {
    countedCheck(after.heads.length === before.heads.length, `${label}: heads ${after.heads.length} vs ${before.heads.length}`);
    after.heads.forEach((h, i) => {
      const bh = before.heads[i];
      if (!bh) return;
      countedCheck(h.text === bh.text && near(h.height, bh.height, 0.5), `${label}: head ${i} ${JSON.stringify(h)} vs ${JSON.stringify(bh)}`);
    });
  }
  // Rows, Total, table.
  countedCheck(after.rows.length === before.rows.length, `${label}: row count ${after.rows.length} vs ${before.rows.length}`);
  after.rows.forEach((row, i) => before.rows[i] && sameRow(`${label} row ${i} "${row.text.slice(0, 24)}"`, row, before.rows[i]));
  countedCheck(after.total && before.total, `${label}: Total row present`);
  if (after.total && before.total) sameRow(`${label} Total`, after.total, before.total);
  countedCheck(near(after.table.width, before.table.width, 0.5), `${label}: table width ${after.table.width} vs ${before.table.width}`);
  const removed = c.coconut ? sum(before.heads.map((h) => h.height)) : 0;
  countedCheck(near(after.table.height, before.table.height - removed, 1), `${label}: table height ${after.table.height} vs ${before.table.height} - ${removed}`);
  countedCheck(near(after.firstTrTop, before.firstTrTop, 0.5), `${label}: first tbody row top ${after.firstTrTop} vs ${before.firstTrTop}`);
  countedCheck(after.struck === before.struck, `${label}: struck ${after.struck} vs ${before.struck}`);
  countedCheck(after.inputs === before.inputs, `${label}: inputs ${after.inputs} vs ${before.inputs}`);
  countedCheck(near(after.overflow, before.overflow, 0.5), `${label}: overflow ${after.overflow} vs ${before.overflow}`);
  if (c.struck) countedCheck(before.struck > 0, `${label}: baseline struck count ${before.struck} is above 0`);
  if (c.inputs) countedCheck(before.inputs > 0, `${label}: baseline grams inputs ${before.inputs} is above 0`);
}

async function run(group) {
  const servers = await startServers();
  const results = {};
  try {
    const baseline = group === 'baseline' ? null : JSON.parse(await readFile(BASELINE_PATH, 'utf8'));
    for (const [engine, make] of engines) {
      if (group === 'tracer' && engine !== 'webkit') continue;
      const browser = await make();
      try {
        for (const w of WIDTHS) {
          for (const c of CASES) {
            if (group === 'tracer' && !(w.width === 1920 && c.id === 'coconut-v2 reading')) continue;
            const key = cellKey(engine, w.width, c.id);
            const read = await measure(browser, servers, w, c);
            results[key] = read;
            const label = `${engine} ${w.width} ${c.id}`;
            if (group === 'baseline') {
              // Precondition: the plan's cause is what the build shows.
              if (c.coconut) {
                countedCheck(read.heads.length === 1 && read.heads[0].text === 'Unallocated', `${label}: baseline has exactly one 'Unallocated' head (read ${JSON.stringify(read.heads)})`);
              } else {
                countedCheck(read.heads.length > 0 && !read.heads.some((h) => h.text === 'Unallocated'), `${label}: baseline has numbered heads and no 'Unallocated' (read ${JSON.stringify(read.heads)})`);
              }
              console.log(JSON.stringify({ cell: key, heads: read.heads, rows: read.rows.length, total: read.total?.text, tableHeight: round(read.table.height), headingToFirstTr: round(read.headingToFirstTr), struck: read.struck, inputs: read.inputs, overflow: read.overflow }));
            } else {
              const before = baseline[key];
              countedCheck(before !== undefined, `${label}: baseline cell exists`);
              if (!before) continue;
              compareCell(label, c, read, before);
              const headRemoved = c.coconut ? sum(before.heads.map((h) => h.height)) : 0;
              console.log(
                JSON.stringify({
                  cell: key,
                  headHeightRemoved: round(headRemoved),
                  tableHeight: [round(before.table.height), round(read.table.height)],
                  rows: read.rows.length,
                  total: read.total?.text,
                  struck: read.struck,
                  inputs: read.inputs,
                  overflow: read.overflow,
                  headingToFirstTr: [round(before.headingToFirstTr), round(read.headingToFirstTr)],
                  headingToFirstIngredient: [round(before.headingToFirstIngredient), round(read.headingToFirstIngredient)],
                }),
              );
            }
          }
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await servers.close();
  }
  if (group === 'baseline') {
    if (failures.length === 0) await writeFile(BASELINE_PATH, JSON.stringify(results, null, 2) + '\n');
  }
}

const group = process.argv[2];
if (!['baseline', 'tracer', 'matrix'].includes(group)) {
  console.log('usage: node 261002-wdn-probe.mjs baseline|tracer|matrix');
  process.exit(2);
}
await run(group);
finish(failures, count, `261002-wdn probe (${group})`);
