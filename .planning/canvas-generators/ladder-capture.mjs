// Sid, 2026-10-03 (decision 32): captures the built app's whole shell (header, side nav, the recipe route, the tab row) for the ladder candidate boards.
//   node ladder-capture.mjs   -> ladder-capture.json
// WebKit, coarse pointer, the dist of 2026-10-03, throwaway 127.0.0.1 servers. At 1194 the folds are closed as the app opens them, so Balance and Watch for are
// opened (a click) because the candidates put Balance beside the table. Mexican Chocolate v3's As made figures are constructed (the seed has none), as in capture.mjs.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const OLIVE1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const AS = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8, 'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };
const construct = (m) => { let sum = 0; for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) { const nc = tr.querySelector('.ingredient-table__col-name'); const num = tr.querySelectorAll('.ingredient-table__col-numeric'); if (!nc || num.length < 2) continue; const name = [...nc.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); if (m[name] === null) continue; num[0].innerHTML = `<span class="sheet-hand">${m[name]} g</span>`; sum += m[name]; } const f = document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0]; if (f) f.innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`; };
const servers = await startServers(); const browser = await webkit.launch(); const out = {};
for (const width of [1366, 1365, 1194]) {
  const ctx = await browser.newContext({ viewport: { width, height: 1024 }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage();
  const grab = async () => { for (const label of ['Balance', 'Watch for']) { const b = page.locator('button[aria-expanded="false"]', { hasText: label }).first(); if (await b.count()) await b.click(); } await page.waitForTimeout(100); return page.evaluate(async () => { await document.fonts.ready; return document.querySelector('.shell').outerHTML; }); };
  await page.goto(servers.appUrl + MEX3, { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table');
  await page.getByRole('button', { name: 'Show changes' }).first().click(); await page.getByRole('button', { name: 'Hide changes' }).first().waitFor();
  await page.evaluate(construct, AS); out[`mex3_${width}`] = await grab();
  await page.goto(servers.appUrl + OLIVE1, { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table'); out[`olive1_${width}`] = await grab();
  await ctx.close();
}
await browser.close(); await servers.close();
await writeFile(path.join(HERE, 'ladder-capture.json'), JSON.stringify(out));
console.log('ok', Object.keys(out).map((k) => k + ':' + out[k].length).join(' '));
