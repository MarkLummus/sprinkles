// Sid, 2026-10-03 (decision 33): captures the built app's whole shell for the final-design boards (g, the fly-out; D3 from 724; Go to batch above 724; Balance open where beside).
//   node final-capture.mjs   -> final-capture.json  (keys state_W)
// WebKit, coarse pointer, the dist of 2026-10-03, throwaway 127.0.0.1 servers. Folds are as the app opens them at that width, except Balance and Watch for, which are opened
// from 984 to 1365 (Mark: "Balance folds open": open wherever the Balance column is beside the ingredients). Mexican Chocolate v3 has Show changes on and constructed As made figures.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const R = { mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01', olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89',
  under2: '/notebook/underbelly-light-base/underbelly-light-base-v2', base2: '/notebook/standard-base/standard-base-v2' };
const AS = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8, 'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };
const construct = (m) => { let sum = 0; for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) { const nc = tr.querySelector('.ingredient-table__col-name'); const num = tr.querySelectorAll('.ingredient-table__col-numeric'); if (!nc || num.length < 2) continue; const name = [...nc.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); if (m[name] === null) continue; num[0].innerHTML = `<span class="sheet-hand">${m[name]} g</span>`; sum += m[name]; } const f = document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0]; if (f) f.innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`; };
const SPECS = [];
for (const W of [744, 834, 983, 984, 1024, 1194, 1366, 1600, 1920]) { SPECS.push(['mex3', W]); SPECS.push(['olive1', W]); }
SPECS.push(['under2', 1600], ['base2', 1600], ['olive1pen', 1600], ['mex3pen', 1600]);
const servers = await startServers(); const browser = await webkit.launch(); const out = {};
for (const [state, W] of SPECS) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage();
  const base = state.replace(/pen$/, '');
  await page.goto(servers.appUrl + R[base], { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table');
  if (base === 'mex3' || base === 'under2') { await page.getByRole('button', { name: 'Show changes' }).first().click(); await page.getByRole('button', { name: 'Hide changes' }).first().waitFor(); }
  if (base === 'mex3') await page.evaluate(construct, AS);
  if (state.endsWith('pen')) {
    await page.getByRole('button', { name: 'Next version' }).first().click(); await page.getByLabel('Salt, grams', { exact: true }).waitFor().catch(() => {});
    if (state === 'mex3pen') for (const [l, v] of [['Whole Milk 3.3%', '540'], ['Sucrose', '44'], ['Cocoa Powder', '18']]) await page.getByLabel(l + ', grams', { exact: true }).fill(v);
    const edit = page.getByRole('button', { name: /edit this step/ }).nth(state === 'olive1pen' ? 2 : 0); if (await edit.count()) await edit.click();
    await page.waitForTimeout(150);
  }
  if (W >= 984 && W < 1366) for (const label of ['Balance', 'Watch for']) { const b = page.locator('button[aria-expanded="false"]', { hasText: label }).first(); if (await b.count()) await b.click(); }
  await page.waitForTimeout(120);
  out[`${state}_${W}`] = await page.evaluate(async () => { await document.fonts.ready; return document.querySelector('.shell').outerHTML; });
  await ctx.close();
}
await browser.close(); await servers.close();
await writeFile(path.join(HERE, 'final-capture.json'), JSON.stringify(out));
console.log('ok', Object.keys(out).length);
