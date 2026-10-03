// Sid, 2026-10-03: board against app for the ingredient-options boards (decision 31). Every row of 1366-ingredient-options.html and
// 1024-ingredient-options.html (Mexican Chocolate v3 with Show changes and As made, Olive Oil v1, the pen with three amounts changed, the
// recording pen) against the built app with the same form's CSS injected, per laid-out cell (0.5px; display:none cells skipped), WebKit and Chrome.
//   node ingredientopts-conform.mjs
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const opt = await readFile(path.join(HERE, 'ingredient-options.css'), 'utf8');
const appcss = await readFile(path.join(HERE, '../../app/src/styles/app.css'), 'utf8');
const sec = (name) => { const r = opt.match(new RegExp('/\\* === ' + name + ' ===[^*]*\\*/([\\s\\S]*?)(?=/\\* === |$)')); if (!r) throw new Error('no section ' + name); return r[1]; };
const i = appcss.indexOf('.ingredient-table thead {'), j = appcss.indexOf('\n}\n', appcss.indexOf('.ingredient-table td.ingredient-table__col-grams > .struck-value'));
const FORMS = { today: '', A: sec('A'), B: appcss.slice(i, j), C: sec('C'), D1: sec('D') + sec('D1'), D1b: sec('D') + sec('D1') + sec('D1b'), D2: sec('D') + sec('D2'), D3: sec('D') + sec('D2') + sec('D3') };
const AS = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8, 'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };
const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const OLIVE1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const ROWS = [
  { row: 'mex', route: MEX3, forms: ['today', 'A', 'B', 'C', 'D1', 'D1b', 'D2', 'D3'], prep: async (p) => {
      await p.getByRole('button', { name: 'Show changes' }).first().click(); await p.getByRole('button', { name: 'Hide changes' }).first().waitFor();
      await p.evaluate((m) => { let sum = 0; for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) { const nc = tr.querySelector('.ingredient-table__col-name'); const num = tr.querySelectorAll('.ingredient-table__col-numeric'); if (!nc || num.length < 2) continue; const name = [...nc.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); const v = m[name]; if (v === null) continue; num[0].innerHTML = `<span class="sheet-hand">${v} g</span>`; sum += v; } document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0].innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`; }, AS); } },
  { row: 'olive', route: OLIVE1, forms: ['today', 'B', 'C', 'D1', 'D1b', 'D2', 'D3'], prep: async () => {} },
  { row: 'pen', route: MEX3, forms: ['today', 'C', 'D1', 'D1b', 'D2', 'D3'], prep: async (p) => {
      await p.getByRole('button', { name: 'Next version' }).first().click(); await p.getByLabel('Salt, grams', { exact: true }).waitFor();
      for (const [l, v] of [['Whole Milk 3.3%', '540'], ['Sucrose', '44'], ['Cocoa Powder', '18']]) await p.getByLabel(l + ', grams', { exact: true }).fill(v); } },
  { row: 'rec', route: OLIVE1, forms: ['today', 'C', 'D1', 'D1b', 'D2', 'D3'], prep: async (p) => {
      await p.getByRole('button', { name: /^Record (another|a batch)$/ }).first().click(); await p.waitForSelector('.ingredient-table__as-made-field');
      const f = p.locator('.ingredient-table__as-made-field'); for (const [k, v] of [[0, '118'], [1, '12'], [3, '0.5'], [5, '248']]) await f.nth(k).fill(v); } },
];
const s = await startServers();
const rd = (root) => { const t = (root || document).querySelector('.ingredient-table'); const o = t.getBoundingClientRect();
  return [...t.querySelectorAll('tr')].map((tr) => ({ t: tr.textContent.replace(/\s+/g, ' ').trim().slice(0, 30), cells: [...tr.children].map((c) => { const b = c.getBoundingClientRect(); return [b.left - o.left, b.top - o.top, b.width, b.height].map((x) => Math.round(x * 10) / 10); }) })); };
let bad = 0, total = 0;
for (const [en, mk] of [['webkit', () => webkit.launch()], ['chrome', () => launch()]]) {
  const b = await mk();
  for (const W of [1366, 1024]) {
    const app = {};
    for (const R of ROWS) for (const form of R.forms) {
      const ctx = await b.newContext({ viewport: { width: W, height: 1100 }, hasTouch: true });
      await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
      const p = await ctx.newPage();
      await p.goto(s.appUrl + R.route, { waitUntil: 'networkidle' }); await p.waitForSelector('.ingredient-table');
      await R.prep(p);
      if (FORMS[form]) await p.addStyleTag({ content: FORMS[form] });
      await p.waitForTimeout(80);
      app[R.row + '|' + form] = await p.evaluate(rd); await ctx.close();
    }
    const ctx = await b.newContext({ viewport: { width: 1366, height: 1000 }, hasTouch: true });
    await ctx.route('**/*', async (r) => { const u = new URL(r.request().url()); if (u.hostname === '127.0.0.1') return r.continue(); if (u.hostname === 'fonts.googleapis.com') return r.fulfill({ contentType: 'text/css', body: `@font-face{font-family:Caveat;src:url(${s.repoUrl}/app/public/fonts/caveat-regular.woff2) format("woff2");font-weight:400}` }); return r.abort(); });
    const p = await ctx.newPage();
    await p.goto(`${s.repoUrl}/.planning/sketches/011-recipe-route-c/${W}-ingredient-options.html`, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
    for (const R of ROWS) for (const form of R.forms) {
      const bd = await p.evaluate((cls) => { const w = document.querySelector('.' + cls); const t = w.querySelector('.ingredient-table'); const o = t.getBoundingClientRect(); return [...t.querySelectorAll('tr')].map((tr) => ({ t: tr.textContent.replace(/\s+/g, ' ').trim().slice(0, 30), cells: [...tr.children].map((c) => { const bb = c.getBoundingClientRect(); return [bb.left - o.left, bb.top - o.top, bb.width, bb.height].map((x) => Math.round(x * 10) / 10); }) })); }, `io-${R.row}-${form}`);
      const ap = app[R.row + '|' + form]; let mism = 0;
      if (ap.length !== bd.length) mism += 1000;
      ap.forEach((r, k) => { const q = bd[k]; if (!q) return; if (r.cells.length !== q.cells.length) { mism++; return; } r.cells.forEach((c, m) => { const o = q.cells[m]; if (c[2] === 0 && c[3] === 0 && o[2] === 0 && o[3] === 0) return; total++; if (c.some((v, z) => Math.abs(v - o[z]) > 0.5)) { mism++; if (mism < 3) console.log('  diff', en, W, R.row, form, r.t, m, c, o); } }); });
      if (mism) console.log(en, W, R.row, form, 'rows', ap.length, 'mismatches', mism); bad += mism;
    }
    await ctx.close();
  }
  await b.close();
}
console.log('total laid-out cells', total, 'mismatches', bad);
await s.close();
