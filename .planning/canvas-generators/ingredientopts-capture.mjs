// Sid, 2026-10-03: captures the built app's Sheet (the .recipe-page article) for the ingredient-table options boards.
//   node ingredientopts-capture.mjs   -> ingredientopts-capture.json
// Serves app/dist through the 03.5 harness's throwaway 127.0.0.1 servers (never :4173, :8011 or a Vite process), WebKit, coarse
// pointer (Mark's iPad), at 1366 and 1024. Mexican Chocolate v3 (a parent, a batch, the longest names) is captured with Show changes
// off and on; the seed's Mexican Chocolate batch has no as-made figures, so the figures in its As made column are CONSTRUCTED here
// (two rows left blank), the only edit to the app's markup. Olive Oil v1 is captured as the app prints it (real as-made figures).
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const OLIVE1 = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
// as made by row name; null leaves the cell blank, as an unrecorded row is
const AS_MADE = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8,
  'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };

const servers = await startServers();
const browser = await webkit.launch();
const out = { note: 'The built app (WebKit, coarse, dist of 2026-10-03). Mexican Chocolate v3 As made figures are constructed; Olive Oil v1 is as the app prints it.' };
for (const width of [1366, 1024]) {
  const ctx = await browser.newContext({ viewport: { width, height: 1100 }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage();
  const grab = () => page.evaluate(async () => { await document.fonts.ready; return document.querySelector('.recipe-page').outerHTML; });
  await page.goto(servers.appUrl + OLIVE1, { waitUntil: 'networkidle' });
  await page.waitForSelector('.ingredient-table');
  out[`olive1_${width}_plain`] = await grab();
  await page.goto(servers.appUrl + MEX3, { waitUntil: 'networkidle' });
  await page.waitForSelector('.ingredient-table');
  const construct = (map) => page.evaluate((m) => {
    let sum = 0, any = false;
    for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) {
      const nameCell = tr.querySelector('.ingredient-table__col-name');
      const num = tr.querySelectorAll('.ingredient-table__col-numeric');
      if (!nameCell || num.length < 2) continue;
      const name = [...nameCell.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
      const v = m[name];
      if (v === undefined) throw new Error('no as-made for ' + name);
      if (v === null) continue;
      num[0].innerHTML = `<span class="sheet-hand">${v} g</span>`;
      sum += v; any = true;
    }
    const foot = document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric');
    if (any) foot[0].innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`;
  }, map);
  await construct(AS_MADE);
  out[`mex3_${width}_plain`] = await grab();
  await page.getByRole('button', { name: 'Show changes' }).first().click();
  await page.getByRole('button', { name: 'Hide changes' }).first().waitFor();
  await construct(AS_MADE);
  out[`mex3_${width}_show`] = await grab();
  await ctx.close();
}
await browser.close();
await servers.close();
await writeFile(path.join(HERE, 'ingredientopts-capture.json'), JSON.stringify(out));
console.log('ok', Object.keys(out).map((k) => k + ':' + out[k].length).join(' '));
