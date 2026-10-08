// Sid, 2026-10-07 (row draw-recipe-declared-notation; README D25): captures the built app's record pen and its reading for two recipes, so the notation boards show the app as it renders them today.
//   node declared-capture.mjs   -> declared-capture.json (keys oo_pen_W, oo_read_W, mx_pen_W, mx_read_W for W in 1366 and 393)
// WebKit, coarse pointer, read from the preview server already on 127.0.0.1:4173 (the dist of 2026-10-06); no server is started here. Olive Oil v1 declares Body and Oil and the flaw Bitter; Mexican Chocolate v1 declares nothing
// (app/src/data/mexican-chocolate.js: declaredAxes [], declaredFlaw null on every version). The pen is the one "Record another" opens with "Add tasting" pressed; the reading is the seeded batch's own, Tasting fold open.
// The clock is fixed at 4 Aug 2026, as markone-capture.mjs does, so no panel carries the capture day.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const RECIPES = { oo: 'http://127.0.0.1:4173/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', mx: 'http://127.0.0.1:4173/notebook/mexican-chocolate/mexican-chocolate-v1' };
const grab = () => { const log = document.querySelector('.notebook-log').cloneNode(true); const live = document.querySelector('.notebook-log');
  const lf = live.querySelectorAll('input, textarea'); const cf = log.querySelectorAll('input, textarea');
  lf.forEach((e, i) => { const c = cf[i]; if (e.tagName === 'TEXTAREA') c.textContent = e.value; else if (e.type === 'radio' || e.type === 'checkbox') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else c.setAttribute('value', e.value); });
  return log.outerHTML; };
const out = {}; const b = await webkit.launch();
for (const W of [1366, 393]) for (const [rk, url] of Object.entries(RECIPES)) {
  const open = async () => { const ctx = await b.newContext({ viewport: { width: W, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 }); const p = await ctx.newPage(); p.setDefaultTimeout(10000);
    await p.clock.setFixedTime(new Date('2026-08-04T12:00:00')); await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300); return [ctx, p]; };
  { const [ctx, p] = await open();   // the pen
    await p.getByRole('button', { name: /record another/i }).first().click(); await p.waitForTimeout(300);
    await p.getByRole('button', { name: /add tasting/i }).first().click(); await p.waitForTimeout(300);
    await p.evaluate(() => document.fonts.ready); out[`${rk}_pen_${W}`] = await p.evaluate(grab); await ctx.close(); }
  { const [ctx, p] = await open();   // the reading: the seeded batch, the Tasting fold open
    const f = p.locator('.notebook-log .fold-row').filter({ hasText: /^tasting/i }).first();
    if (await f.count()) { if ((await f.getAttribute('aria-expanded')) === 'false') { await f.click(); await p.waitForTimeout(250); } }
    await p.evaluate(() => document.fonts.ready); out[`${rk}_read_${W}`] = await p.evaluate(grab); await ctx.close(); }
}
await b.close();
await writeFile(path.join(HERE, 'declared-capture.json'), JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => k + ' ' + v.length + ' tasting-reading:' + v.includes('tasting-reading') + ' axes-grid:' + v.includes('axes-grid')).join('\n')); process.exit(0);
