// Sid, 2026-10-03 (decision 32, Mark's standing preference: "I prefer the As made in the first column ..."; then "honestly it might not work"):
// does As made as the table's first column work, by width? The D3 grid (ingredient-options.css D, D2, D3) already puts As made first; this measures it
// against the phone (where the app stacks it under the plan amount) and with a writing column of 56px (the app's --sheet-field-w-figure) and 72px.
//   node asmade-first-measure.mjs   -> asmade-first-measure.json
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const opt = await readFile(path.join(HERE, 'ingredient-options.css'), 'utf8');
const sec = (name) => { const r = opt.match(new RegExp('/\\* === ' + name + ' ===[^*]*\\*/([\\s\\S]*?)(?=/\\* === |$)')); if (!r) throw new Error('no ' + name); return r[1]; };
const D3 = sec('D') + sec('D2') + sec('D3');
const MEX3 = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const AS = { 'Whole Milk 3.3%': 503, 'Cocoa Powder': 16.4, 'Sucrose': 46, 'Dextrose': 45, 'Fructose': 4.5, 'Dried Skimmed Milk Powder': 34.8, 'Salt': null, 'Cream, heavy': 77, 'Vanilla Extract': null, 'Stabilizer Mix 4421': 2, 'Cinnamon': 2.3, 'Allulose': 37 };
const construct = (m) => { let sum = 0; for (const tr of document.querySelectorAll('.ingredient-table tbody > tr')) { const nc = tr.querySelector('.ingredient-table__col-name'); const num = tr.querySelectorAll('.ingredient-table__col-numeric'); if (!nc || num.length < 2) continue; const name = [...nc.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim(); if (m[name] === null) continue; num[0].innerHTML = `<span class="sheet-hand">${m[name]} g</span>`; sum += m[name]; } const f = document.querySelectorAll('.ingredient-table tfoot .ingredient-table__col-numeric')[0]; if (f) f.innerHTML = `<span class="sheet-hand">${Math.round(sum * 10) / 10} g</span>`; };
async function read() {
  await document.fonts.ready;
  const table = document.querySelector('.ingredient-table');
  const lines = (cell) => { const tn = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()); if (!tn) return 0; const r = document.createRange(); r.selectNodeContents(tn); const tops = []; for (const q of r.getClientRects()) if (!tops.some((x) => Math.abs(x - q.top) < 3)) tops.push(q.top); return tops.length; };
  const names = [...table.querySelectorAll('tbody td.ingredient-table__col-name')]; const ls = names.map(lines);
  const first = table.querySelector('tbody > tr:not(.ingredient-table__step-head)');
  const asm = [...table.querySelectorAll('tbody td.ingredient-table__col-numeric:nth-last-child(2)')].find((e) => e.textContent.trim());
  return { table: Math.round(table.closest('.ingredient-table-region').getBoundingClientRect().width * 10) / 10, nameMin: Math.round(Math.min(...names.map((n) => n.getBoundingClientRect().width)) * 10) / 10, maxRows: Math.max(...ls), wrapped: names.map((n, i) => [[...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join('').trim(), ls[i]]).filter((x) => x[1] > 1), asMadeX: asm ? Math.round(asm.getBoundingClientRect().left - table.getBoundingClientRect().left) : null, asMadeW: asm ? Math.round(asm.getBoundingClientRect().width * 10) / 10 : null, planX: Math.round(first.querySelector('.ingredient-table__col-grams').getBoundingClientRect().right - table.getBoundingClientRect().left), overflow: document.documentElement.scrollWidth - innerWidth };
}
const PHONE_HEAD_OFF = '.ingredient-table thead{display:none}';
const RUNS = [[320, 'phone'], [375, 'phone'], [393, 'phone'], [428, 'phone'], [723, 'phone'], [724, 'wide'], [834, 'wide'], [984, 'wide'], [1024, 'wide'], [1194, 'wide'], [1366, 'wide'], [1440, 'wide'], [1600, 'wide'], [1920, 'wide']];
const servers = await startServers(); const out = [];
for (const [engine, mk] of [['webkit', () => webkit.launch()], ['chrome', () => launch()]]) {
  const browser = await mk();
  for (const [width, kind] of RUNS) for (const variant of kind === 'phone' ? ['today (stacked P3 not applied)', 'as made first 56', 'as made first 72'] : ['column form (as built)', 'as made first 56', 'as made first 72']) {
    const ctx = await browser.newContext({ viewport: { width, height: 1024 }, hasTouch: true });
    await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
    const page = await ctx.newPage();
    try {
      await page.goto(servers.appUrl + MEX3, { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table');
      await page.getByRole('button', { name: 'Show changes' }).first().click(); await page.getByRole('button', { name: 'Hide changes' }).first().waitFor();
      await page.evaluate(construct, AS);
      if (variant.startsWith('as made first')) await page.addStyleTag({ content: (variant.endsWith('72') ? ':root{--sheet-field-w-figure:72px}' : '') + D3 + (kind === 'phone' ? PHONE_HEAD_OFF : '') });
      await page.waitForTimeout(80);
      out.push({ engine, width, kind, variant, ...(await page.evaluate(read)) });
    } catch (e) { out.push({ engine, width, kind, variant, error: String(e).slice(0, 160) }); }
    await ctx.close();
  }
  await browser.close();
}
await servers.close();
await writeFile(path.join(HERE, 'asmade-first-measure.json'), JSON.stringify(out));
console.log('ok', out.length, 'errors', out.filter((r) => r.error).length);
