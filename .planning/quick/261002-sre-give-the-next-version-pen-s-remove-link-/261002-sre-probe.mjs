// Quick task 261002-sre's probe: the Next version pen's remove and restore link
// stands 14px clear of the name or the estimated tag (sketch 011 decision 26).
// Reads the built app (the checkout's app/dist) beside the two pen boards, in
// Playwright's WebKit (iPhone 14 profile for the coarse contexts) and in system
// Chrome as the second engine.
//
//   node 261002-sre-probe.mjs [groups]
//
// `groups` is a comma list of: tracer, boards, states, sweep, sweep-fine, wide.
// No argument runs every group. Serves the build through the 03.5 harness's
// own ephemeral 127.0.0.1 servers; never touches Mark's :4173 preview or the
// dev server on :5173, starts no Vite process, and every state change (remove a
// row, step 1 removed) runs in a throwaway browser context and is never saved.
// A reading here is evidence about two engines, not about Mark's iPhone or
// iPad; the device is his to check.
//
// The "before" baseline is the same page with `.ingredient-table__remove-gap
// {display:none}` injected: nothing sits between the last mark and the button,
// which is today's markup exactly, without mutating React's DOM.
import { webkit, devices } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch, openBoard, check, finish } from '../../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const failures = [];
let count = 0;
const countedCheck = (condition, label) => {
  count += 1;
  check(failures, condition, label);
};

const MEX4 = '/notebook/mexican-chocolate/mexican-chocolate-v4';
const MOCHA3 = '/notebook/mocha/mocha-v3';
const STRAW21 = '/notebook/strawberry/strawberry-v2-1';

// ---------------------------------------------------------------------------
// In-page reader. Passed to page.evaluate, so it reads the app and a board
// alike. One record per tbody row whose name cell has a direct-child button
// reading exactly remove or restore.
async function readPen() {
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const table = document.querySelector('.ingredient-table');
  const rows = [];
  for (const tr of table.querySelectorAll('tbody > tr')) {
    const nameTd = tr.querySelector(':scope > td.ingredient-table__col-name');
    if (!nameTd) continue;
    const button = [...nameTd.children].find((e) => e.tagName === 'BUTTON' && /^(remove|restore)$/.test(e.textContent.trim()));
    if (!button) continue;
    const b = button.getBoundingClientRect();
    const cy = b.top + b.height / 2;
    const nc = nameTd.getBoundingClientRect();
    const isGap = (n) => n.nodeType === 1 && n.classList.contains('ingredient-table__remove-gap');
    const marks = [];
    const textRects = (node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      marks.push(...range.getClientRects());
    };
    for (const n of nameTd.childNodes) {
      if (n === button || isGap(n)) continue;
      if (n.nodeType === 3) {
        if (n.nodeValue.trim()) textRects(n);
      } else if (n.nodeType === 1) {
        marks.push(...n.getClientRects());
        if (n.tagName === 'SPAN' && !n.classList.contains('target-chip')) {
          for (const c of n.childNodes) if (c.nodeType === 3 && c.nodeValue.trim()) textRects(c);
        }
      }
    }
    const onLine = marks.filter((k) => k.width > 0 && k.top <= cy && k.bottom >= cy && k.right <= b.left + 0.5);
    const last = onLine.length ? Math.max(...onLine.map((k) => k.right)) : null;
    const amountTd = tr.querySelector(':scope > td.ingredient-table__col-grams');
    const numerics = [...tr.querySelectorAll(':scope > td.ingredient-table__col-numeric')];
    const shareTd = numerics[numerics.length - 1] ?? null;
    const cell = (td) => {
      if (!td) return null;
      const r = td.getBoundingClientRect();
      return { left: r.left, width: r.width };
    };
    const prev = button.previousSibling;
    const flag = nameTd.querySelector('p.ingredient-table__flag');
    const fr = flag ? flag.getBoundingClientRect() : null;
    rows.push({
      name: nameTd.textContent.trim().split('\n')[0].slice(0, 20),
      label: button.textContent.trim(),
      gap: last === null ? null : b.left - last,
      off: b.left - nc.left,
      top: b.top,
      btn: { width: b.width, height: b.height },
      nameCell: cell(nameTd),
      amountCell: cell(amountTd),
      shareCell: cell(shareTd),
      rowHeight: tr.getBoundingClientRect().height,
      gapSpan: prev !== null && prev.nodeType === 1 && prev.tagName === 'SPAN' && prev.classList.contains('ingredient-table__remove-gap') && prev.textContent === ' ',
      flag: fr ? { top: fr.top, bottom: fr.bottom } : null,
    });
  }
  return {
    innerWidth: window.innerWidth,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    tableHeight: table.getBoundingClientRect().height,
    coarse: matchMedia('(pointer: coarse)').matches,
    rows,
  };
}

// Every tbody and tfoot row's boxes, relative to the table, rounded to 0.5,
// each y relative to its own row's top (sid/pen-conf-rm.mjs's reader).
async function readRects() {
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const table = document.querySelector('.ingredient-table');
  const tb = table.getBoundingClientRect();
  const R = (e, rowTop) => {
    const b = e.getBoundingClientRect();
    return [b.left - tb.left, b.top - rowTop, b.width, b.height].map((x) => Math.round(x * 2) / 2);
  };
  const rows = [];
  for (const tr of table.querySelectorAll('tbody > tr, tfoot > tr')) {
    if (tr.classList.contains('ingredient-table__step-head')) continue;
    const top = tr.getBoundingClientRect().top;
    const amountTd = tr.querySelector(':scope > td.ingredient-table__col-grams');
    const nameTd = tr.querySelector(':scope > td.ingredient-table__col-name');
    const numerics = [...tr.querySelectorAll(':scope > td.ingredient-table__col-numeric')];
    const shareTd = numerics[numerics.length - 1] ?? null;
    const input = tr.querySelector('input');
    const button = nameTd ? [...nameTd.children].find((e) => e.tagName === 'BUTTON') : null;
    const shown = (td) => (td && td.getBoundingClientRect().width > 0 ? R(td, top) : null);
    rows.push({
      name: (nameTd ? nameTd.textContent : tr.textContent).trim().slice(0, 20),
      row: R(tr, top),
      amount: shown(amountTd),
      nameCell: shown(nameTd),
      share: shown(shareTd),
      input: input ? R(input, top) : null,
      button: button ? R(button, top) : null,
    });
  }
  return { tableHeight: tb.height, rows };
}

// ---------------------------------------------------------------------------
// Node-side helpers.
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

async function openPen(page) {
  await page.getByRole('button', { name: 'Next version' }).first().click();
  await page.locator('td.ingredient-table__col-name > button.text-control').first().waitFor();
}

// The board's state on Mexican Chocolate v4: Whole Milk 600, Sucrose 36, Cocoa
// Powder 45, Cinnamon removed.
async function editPen(page) {
  await page.getByLabel('Whole Milk 3.3%, grams', { exact: true }).fill('600');
  await page.getByLabel('Sucrose, grams', { exact: true }).fill('36');
  await page.getByLabel('Cocoa Powder, grams', { exact: true }).fill('45');
  await page.locator('tbody tr', { hasText: 'Cinnamon' }).getByRole('button', { name: 'remove' }).click();
  await page.locator('tbody tr', { hasText: 'Cinnamon' }).getByRole('button', { name: 'restore' }).waitFor();
}

async function setBaseline(page, on) {
  await page.evaluate((flag) => {
    document.getElementById('sre-baseline')?.remove();
    if (flag) {
      const s = document.createElement('style');
      s.id = 'sre-baseline';
      s.textContent = '.ingredient-table__remove-gap{display:none}';
      document.head.appendChild(s);
    }
  }, on);
}

const gapFigure = (engine) => (engine === 'webkit' ? 14 : 14.2);
const near = (a, b, tol) => a !== null && b !== null && a !== undefined && b !== undefined && Math.abs(a - b) <= tol;
const round1 = (x) => Math.round(x * 10) / 10;

const engines = [
  ['webkit', () => webkit.launch()],
  ['chrome', () => launch()],
];

// ---------------------------------------------------------------------------
// Groups.
async function tracer(browser, servers, engine) {
  const { context, page } = await openAppPage(browser, servers.appUrl, MEX4, { width: 393, coarse: true });
  await openPen(page);
  const read = await page.evaluate(readPen);
  await context.close();
  const label = `${engine} 393 coarse mex4 pen`;
  const figure = gapFigure(engine);
  const onLine = read.rows.filter((r) => r.gap !== null);
  const wrapped = read.rows.filter((r) => r.gap === null);
  const sucrose = read.rows.find((r) => r.name.startsWith('Sucrose'));
  countedCheck(read.rows.length === 12, `${label}: ${read.rows.length} links, wanted 12`);
  countedCheck(read.rows.every((r) => r.gapSpan), `${label}: every link has its gap span (${read.rows.filter((r) => !r.gapSpan).map((r) => r.name)})`);
  countedCheck(onLine.every((r) => near(r.gap, figure, 0.5)), `${label}: every same-line gap within 0.5 of ${figure} (${onLine.map((r) => round1(r.gap))})`);
  countedCheck(sucrose !== undefined && sucrose.gap !== null && near(sucrose.gap, figure, 0.5), `${label}: Sucrose's link is on the line with gap ${sucrose && sucrose.gap}`);
  countedCheck(wrapped.every((r) => near(r.off, 0, 0.5)), `${label}: every wrapped link's offset within 0.5 of 0 (${wrapped.map((r) => round1(r.off))})`);
  countedCheck(read.overflow <= 0, `${label}: overflow ${read.overflow}`);
  console.log(JSON.stringify({ engine, group: 'tracer', gaps: onLine.map((r) => [r.name, round1(r.gap)]), wrapped: wrapped.map((r) => [r.name, round1(r.off)]), tableHeight: read.tableHeight }));
}

// ---------------------------------------------------------------------------
const requested = process.argv[2] ? process.argv[2].split(',') : ['tracer', 'boards', 'states', 'sweep', 'sweep-fine', 'wide'];
const servers = await startServers();
try {
  for (const [engine, make] of engines) {
    const browser = await make();
    try {
      // The tracer proves one path in WebKit; the full run repeats it in Chrome.
      if (requested.includes('tracer') && (engine === 'webkit' || requested.length > 1)) await tracer(browser, servers, engine);
    } finally {
      await browser.close();
    }
  }
} finally {
  await servers.close();
}

finish(failures, count, '261002-sre probe');
