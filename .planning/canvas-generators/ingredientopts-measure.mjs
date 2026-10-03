// Sid, 2026-10-03: measures the ingredient table's four forms (today, A, B, C) on the BUILT app, in-page, no app edit.
//   node ingredientopts-measure.mjs   -> ingredientopts-measure.json
// The forms are CSS injected into the real DOM: A and C from ingredient-options.css, B is the app's own phone list-form rules read
// out of app/src/styles/app.css. WebKit and system Chrome, coarse and fine, through the 03.5 harness's throwaway 127.0.0.1 servers.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const optcss = await readFile(path.join(HERE, 'ingredient-options.css'), 'utf8');
const A = optcss.split('/* === A === */')[1].split('/* === C === */')[0];
const C = optcss.split('/* === C === */')[1];
const appcss = await readFile(path.join(HERE, '../../app/src/styles/app.css'), 'utf8');
const blockStart = appcss.indexOf('.ingredient-table thead {');
const blockEnd = appcss.indexOf('\n}\n', appcss.indexOf('.ingredient-table td.ingredient-table__col-grams > .struck-value'));
if (blockStart < 0 || blockEnd < 0) throw new Error('list form rules not found in app.css');
const B = appcss.slice(blockStart, blockEnd);
const FORMS = { today: '', A, B, C };

const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const MEX4 = '/notebook/mexican-chocolate/mexican-chocolate-v4';
const OLIVE1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const MOCHA3 = '/notebook/mocha/mocha-v3/batch/mocha-v3-batch-01';
const STATES = [
  { id: 'mex3 batch, changes on, as made written', route: MEX3, changes: true, construct: true },
  { id: 'mex3 batch, changes on, as made empty (the seed)', route: MEX3, changes: true, construct: false },
  { id: 'mex3 batch, as made written', route: MEX3, changes: false, construct: true },
  { id: 'mocha3 batch, changes on, as made written', route: MOCHA3, changes: true, construct: true },
  { id: 'mex4 reading (no batch)', route: MEX4, changes: false, construct: false },
  { id: 'mex4 changes on (no batch)', route: MEX4, changes: true, construct: false },
  { id: 'olive1 batch (real as made)', route: OLIVE1, changes: false, construct: false },
];
const WIDTHS = [984, 1024, 1204, 1366, 1600];
const AS_MADE = (m) => {
  for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) {
    const num = tr.querySelectorAll('.ingredient-table__col-numeric');
    const plan = tr.querySelector('.ingredient-table__plan-grams');
    if (!plan || num.length < 2 || num[0].textContent.trim()) continue;
    const v = parseFloat(plan.textContent);
    num[0].innerHTML = `<span class="sheet-hand">${v >= 10 ? Math.round(v) + 3 : (v + 0.3).toFixed(1)} g</span>`;
  }
};
async function read() {
  await document.fonts.ready;
  const table = document.querySelector('.ingredient-table');
  const lines = (cell) => {
    const tn = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
    if (!tn) return 0;
    const r = document.createRange(); r.selectNodeContents(tn);
    const tops = [];
    for (const q of r.getClientRects()) if (!tops.some((x) => Math.abs(x - q.top) < 3)) tops.push(q.top);
    return tops.length;
  };
  const names = [...table.querySelectorAll('tbody td.ingredient-table__col-name')];
  const ls = names.map(lines);
  const first = table.querySelector('tbody > tr:not(.ingredient-table__step-head)');
  const rowsH = [...table.querySelectorAll('tbody > tr:not(.ingredient-table__step-head)')].map((t) => t.getBoundingClientRect().height);
  return {
    region: table.closest('.ingredient-table-region').getBoundingClientRect().width,
    nameMin: Math.min(...names.map((n) => n.getBoundingClientRect().width)),
    maxRows: Math.max(...ls),
    wrapped: names.map((n, i) => [[...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join('').trim(), ls[i]]).filter((x) => x[1] > 1),
    cells: [...first.children].map((c) => Math.round(c.getBoundingClientRect().width * 10) / 10),
    tableH: table.getBoundingClientRect().height,
    headH: table.querySelector('thead') ? table.querySelector('thead').getBoundingClientRect().height : 0,
    rowH: [Math.min(...rowsH), Math.max(...rowsH)],
    sheetH: document.querySelector('.recipe-page').getBoundingClientRect().height,
    overflow: document.documentElement.scrollWidth - innerWidth,
  };
}
const servers = await startServers();
const out = [];
for (const [engine, mk] of [['webkit', () => webkit.launch()], ['chrome', () => launch()]]) {
  const browser = await mk();
  for (const coarse of [true, false]) for (const width of WIDTHS) for (const st of STATES) for (const [form, css] of Object.entries(FORMS)) {
    const ctx = await browser.newContext({ viewport: { width, height: 1100 }, hasTouch: coarse, deviceScaleFactor: 1 });
    await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
    const page = await ctx.newPage();
    await page.goto(servers.appUrl + st.route, { waitUntil: 'networkidle' });
    await page.waitForSelector('.ingredient-table');
    if (st.changes) {
      await page.getByRole('button', { name: 'Show changes' }).first().click();
      await page.getByRole('button', { name: 'Hide changes' }).first().waitFor();
    }
    if (st.construct && await page.evaluate(() => [...document.querySelectorAll('.ingredient-table thead th')].some((h) => /as made/i.test(h.textContent)))) await page.evaluate(AS_MADE);
    if (css) await page.addStyleTag({ content: css });
    await page.waitForTimeout(60);
    out.push({ engine, coarse, width, state: st.id, form, ...(await page.evaluate(read)) });
    await ctx.close();
  }
  await browser.close();
}
await servers.close();
await writeFile(path.join(HERE, 'ingredientopts-measure.json'), JSON.stringify(out));
console.log('ok', out.length);
