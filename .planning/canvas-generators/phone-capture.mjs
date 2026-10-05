// Sid, 2026-10-04 (decision 41, question 2; Mark: redraw the other boards now): captures the built app's whole shell at the phone widths for the redrawn phone boards.
//   node phone-capture.mjs   -> phone-capture.json (keys state_W) and phone-geo.json (the band's, the Sheet's and the log's boxes, for the crops)
// WebKit, coarse pointer, read from the preview server already on 127.0.0.1:4173 (the dist of 2026-10-04 after quick 261004-ly8); no server is started here. 393 and 723 (below the 724 cut). Mexican Chocolate v3 (a parent, a batch awaiting
// its tasting, four versions (mex3off: the same with Show changes off); Show changes on and constructed As made figures, as final-capture.mjs sets them), Olive Oil v1 (a tasted batch, its real As made figures) and Underbelly Light Base v2 (a parent, no batch yet, Show changes on).
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const R = { mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01', olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89', under2: '/notebook/underbelly-light-base/underbelly-light-base-v2', mex3off: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01' };
const AS = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8, 'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };
const construct = (m) => { let sum = 0; for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) { const nc = tr.querySelector('.ingredient-table__col-name'); const num = tr.querySelectorAll('.ingredient-table__col-numeric'); if (!nc || num.length < 2) continue; const name = [...nc.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); if (m[name] === null) continue; num[0].innerHTML = `<span class="sheet-hand">${m[name]} g</span>`; sum += m[name]; } const f = document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0]; if (f) f.innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`; };
const browser = await webkit.launch(); const out = {}, geo = {};
for (const W of [393, 723]) for (const state of Object.keys(R)) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 }); const page = await ctx.newPage(); page.setDefaultTimeout(10000);
  await page.goto('http://127.0.0.1:4173' + R[state], { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table');
  if (state === 'mex3' || state === 'under2') { await page.getByRole('button', { name: 'Show changes' }).first().click(); await page.getByRole('button', { name: 'Hide changes' }).first().waitFor(); }
  if (state === 'mex3' || state === 'mex3off') await page.evaluate(construct, AS);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(250);
  out[`${state}_${W}`] = await page.evaluate(async () => { await document.fonts.ready; return document.querySelector('.shell').outerHTML; });
  geo[`${state}_${W}`] = await page.evaluate(() => { const sh = document.querySelector('.shell').getBoundingClientRect(); const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: +(b.x - sh.x).toFixed(1), y: +(b.y - sh.y).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
    return { shell: r(document.querySelector('.shell')), band: r(document.querySelector('.notebook-band')), sheet: r(document.querySelector('.recipe-page')), log: r(document.querySelector('.notebook-log')), jump: r(document.querySelector('.notebook-jump')), ing: r(document.querySelector('.ingredient-table-region')), docH: Math.round(document.documentElement.scrollHeight) }; });
  await ctx.close();
}
await browser.close();
await writeFile(path.join(HERE, 'phone-capture.json'), JSON.stringify(out)); await writeFile(path.join(HERE, 'phone-geo.json'), JSON.stringify(geo, null, 1));
console.log(JSON.stringify(geo, null, 1).slice(0, 3000)); process.exit(0);
