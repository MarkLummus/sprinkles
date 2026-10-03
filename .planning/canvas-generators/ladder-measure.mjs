// Sid, 2026-10-03 (decision 32): the recipe route's four columns (nav rail, ingredients, Balance, batch log) measured on the BUILT app
// (app/dist, WebKit and system Chrome, coarse pointer, throwaway 127.0.0.1 servers, nothing on :4173 or :8011, no Vite).
//   node ladder-measure.mjs   -> ladder-measure.json
// Candidates at 1366 are the app's own rules moved, in-page, no app edit:
//   a today; b Balance below the ingredients (app.css's one-column Sheet block unwrapped); c the log below (the app at 1365);
//   d the bottom tab row in place of the rail (shell.css's 983 block unwrapped); p the proposed ladder at the given window (see PLAN).
// The ingredient table is measured in the D3 form (ingredient-options.css D, D2, D3) and in today's column form.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const rd = (f) => readFile(path.join(HERE, f), 'utf8');
const opt = await rd('ingredient-options.css');
const sec = (name) => { const r = opt.match(new RegExp('/\\* === ' + name + ' ===[^*]*\\*/([\\s\\S]*?)(?=/\\* === |$)')); if (!r) throw new Error('no ' + name); return r[1]; };
const D3 = sec('D') + sec('D2') + sec('D3');
const appcss = await rd('../../app/src/styles/app.css'), shellcss = await rd('../../app/src/styles/shell.css');
const block = (css, cond) => { const i = css.indexOf('@media ' + cond + ' {'); if (i < 0) throw new Error('no block ' + cond); let k = css.indexOf('{', i), d = 1, m = k + 1; while (d) { d += (css[m] === '{') - (css[m] === '}'); m++; } return css.slice(k + 1, m - 1); };
const SHEET_ONE_COL = block(appcss, '(max-width: 983.98px)');
const TAB_ROW = block(shellcss, '(max-width: 983.98px)');
// d keeps the header's Search, Import and Export (the as-built tab-row block hides them: shell.css D-16); e is a narrow rail that keeps the words, icon over label, the tab row's own place style turned vertical
const TAB_KEEP_TOOLS = TAB_ROW.replace(/\.shell__tools > \.shell__place \{\s*display: none;\s*\}/, '');
if (TAB_KEEP_TOOLS === TAB_ROW) throw new Error('tools rule not found');
const NARROW_RAIL = '.shell__rail{flex:0 0 84px;width:84px;padding:var(--gap-xs) var(--gap-xs) var(--gap-l)}.shell__rail .shell__place{flex-direction:column;justify-content:center;gap:var(--gap-hair);padding:var(--gap-xs) 0;text-align:center;font-size:var(--app-size-label)}';
const CAND = { a: '', b: SHEET_ONE_COL, d: TAB_KEEP_TOOLS, bd: SHEET_ONE_COL + TAB_KEEP_TOOLS, e: NARROW_RAIL };
const ASTACK = '.ingredient-table__plan-grams>.struck-value,.ingredient-table td.ingredient-table__col-numeric>.struck-value,.ingredient-table td.ingredient-table__col-grams>.struck-value{display:block;margin-right:0}';
const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const OLIVE1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const AS = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8, 'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };
const construct = (m) => { let sum = 0; for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) { const nc = tr.querySelector('.ingredient-table__col-name'); const num = tr.querySelectorAll('.ingredient-table__col-numeric'); if (!nc || num.length < 2) continue; const name = [...nc.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); if (m[name] === null) continue; num[0].innerHTML = `<span class="sheet-hand">${m[name]} g</span>`; sum += m[name]; } const f = document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0]; if (f) f.innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`; };
async function read() {
  await document.fonts.ready;
  const abs = (el) => (el ? Math.round(el.getBoundingClientRect().top + scrollY) : null);
  const w = (el) => (el && getComputedStyle(el).display !== 'none' ? Math.round(el.getBoundingClientRect().width * 10) / 10 : 0);
  const heading = (txt) => [...document.querySelectorAll('h2')].find((h) => h.textContent.replace(/Hide|Show/g, '').trim() === txt);
  const table = document.querySelector('.ingredient-table');
  const lines = (cell) => { const tn = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()); if (!tn) return 0; const r = document.createRange(); r.selectNodeContents(tn); const tops = []; for (const q of r.getClientRects()) if (!tops.some((x) => Math.abs(x - q.top) < 3)) tops.push(q.top); return tops.length; };
  const names = [...table.querySelectorAll('tbody td.ingredient-table__col-name')]; const ls = names.map(lines);
  const bal = document.querySelector('.formulation-note-region');
  const log = document.querySelector('.notebook-log');
  return {
    nav: w(document.querySelector('.shell__rail')), tabs: getComputedStyle(document.querySelector('.shell__tabs')).display !== 'none',
    sheet: w(document.querySelector('.recipe-page')), table: w(document.querySelector('.ingredient-table-region')), side: w(document.querySelector('.side-region')), log: w(log),
    logBeside: !!log && log.getBoundingClientRect().left > document.querySelector('.recipe-page').getBoundingClientRect().right - 5,
    nameMin: Math.round(Math.min(...names.map((n) => n.getBoundingClientRect().width)) * 10) / 10, maxRows: Math.max(...ls),
    wrapped: names.map((n, i) => [[...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join('').trim(), ls[i]]).filter((x) => x[1] > 1),
    tableH: Math.round(table.getBoundingClientRect().height), sheetH: Math.round(document.querySelector('.recipe-page').getBoundingClientRect().height), docH: document.documentElement.scrollHeight,
    yIng: abs(heading('Ingredients')), yBal: abs(heading('Balance')), yBatch: abs(log), yInstr: abs(heading('Instructions')), balH: bal ? Math.round(bal.getBoundingClientRect().height) : null,
    overflow: document.documentElement.scrollWidth - innerWidth,
  };
}
const openFolds = async (p) => { for (const label of ['Balance', 'Watch for']) { const b = p.locator('button[aria-expanded="false"]', { hasText: label }).first(); if (await b.count()) await b.click(); } };
const closeFolds = async (p) => { for (const label of ['Balance', 'Watch for']) { const b = p.locator('button[aria-expanded="true"]', { hasText: label }).first(); if (await b.count()) await b.click(); } };
const STATES = [{ id: 'Mexican Chocolate v3, Show changes on, As made constructed', route: MEX3, changes: true, construct: true }, { id: 'Olive Oil v1, As made as seeded', route: OLIVE1 }];
// [window, candidate key, label]
const RUNS = [[1366, 'a', 'a today'], [1366, 'b', 'b Balance below'], [1365, 'a', 'c log below (the app at 1365)'], [1366, 'd', 'd tab row for the rail'], [1366, 'e', 'e narrow rail'],
  [984, 'a', 'today'], [1024, 'a', 'today'], [1024, 'd', 'd tab row, Sheet 2 columns'], [1024, 'bd', 'tab row, Sheet 1 column'], [834, 'a', 'today'], [834, 'd', 'd tab row, Sheet 2 columns'],
  [1194, 'a', 'today = c'], [1194, 'd', 'd tab row'], [1194, 'e', 'e narrow rail'], [1225, 'd', 'd tab row, log below'], [1226, 'd', 'd tab row, log beside'], [1440, 'a', 'today'], [1440, 'd', 'd tab row'],
  [1449, 'd', 'd tab row'], [1450, 'a', 'rail returns'], [1600, 'a', 'today'], [1920, 'a', 'today'], [1067, 'a', 'today'], [843, 'd', 'd tab row'], [844, 'd', 'd tab row']];
const servers = await startServers();
const out = [];
for (const [engine, mk] of [['webkit', () => webkit.launch()], ['chrome', () => launch()]]) {
  const browser = await mk();
  for (const [width, key, label] of RUNS) for (const st of STATES) for (const form of ['d3', 'column', 'astack']) for (const folds of ['default', 'open', 'closed']) {
    if (folds !== 'default' && form === 'astack') continue;
    if (folds !== 'default' && ![1366, 1365, 1194, 1024].includes(width)) continue;
    const ctx = await browser.newContext({ viewport: { width, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 });
    await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
    const page = await ctx.newPage();
    try {
      await page.goto(servers.appUrl + st.route, { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table');
      if (st.changes) { await page.getByRole('button', { name: 'Show changes' }).first().click(); await page.getByRole('button', { name: 'Hide changes' }).first().waitFor(); }
      if (st.construct) await page.evaluate(construct, AS);
      if (folds === 'open') await openFolds(page); if (folds === 'closed') await closeFolds(page);
      const css = CAND[key] + (form === 'd3' ? D3 : form === 'astack' ? ASTACK : '');
      if (css) await page.addStyleTag({ content: css });
      await page.waitForTimeout(80);
      out.push({ engine, width, key, label, state: st.id, form, folds, ...(await page.evaluate(read)) });
    } catch (e) { out.push({ engine, width, key, label, state: st.id, form, folds, error: String(e).slice(0, 160) }); }
    await ctx.close();
  }
  await browser.close();
}
await servers.close();
await writeFile(path.join(HERE, 'ladder-measure.json'), JSON.stringify(out));
console.log('ok', out.length, 'errors', out.filter((r) => r.error).length);
