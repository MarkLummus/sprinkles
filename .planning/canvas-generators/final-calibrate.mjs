// Sid, 2026-10-03 (decision 33): measures every panel of the final-design page boards (as served from the snapshot) so the generator can size the windows and write the captions from numbers.
//   node final-calibrate.mjs   -> final-heights.json, final-board-measure.json
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILES = JSON.parse(process.argv[2] || "[]"); console.log(FILES.length);
const s = await startServers(); const b = await webkit.launch(); const heights = {}, facts = {};
for (const f of FILES) {
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 }, hasTouch: true });
  await ctx.route('**/*', async (r) => { const u = new URL(r.request().url()); if (u.hostname === '127.0.0.1') return r.continue(); if (u.hostname === 'fonts.googleapis.com') return r.fulfill({ contentType: 'text/css', body: `@font-face{font-family:Caveat;src:url(${s.repoUrl}/app/public/fonts/caveat-regular.woff2) format("woff2");font-weight:400}` }); return r.abort(); });
  const p = await ctx.newPage();
  await p.goto(`${s.repoUrl}/.planning/sketches/011-recipe-route-c/${f}.html`, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  const res = await p.evaluate(() => [...document.querySelectorAll('.fp-win')].map((w) => {
    const cls = [...w.classList].find((c) => c.startsWith('fp-') && c !== 'fp-win');
    const sh = w.querySelector('.shell'); const top = sh.getBoundingClientRect().top;
    const wd = (e) => (e && getComputedStyle(e).display !== 'none' ? Math.round(e.getBoundingClientRect().width * 10) / 10 : 0);
    const heading = (t) => [...w.querySelectorAll('h2')].find((h) => h.textContent.replace(/Hide|Show/g, '').trim() === t);
    const table = w.querySelector('.ingredient-table'); const lines = (cell) => { const tn = [...cell.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()); if (!tn) return 0; const r = document.createRange(); r.selectNodeContents(tn); const tops = []; for (const q of r.getClientRects()) if (!tops.some((x) => Math.abs(x - q.top) < 3)) tops.push(q.top); return tops.length; };
    const names = table ? [...table.querySelectorAll('tbody td.ingredient-table__col-name')] : []; const ls = names.map(lines);
    const region = w.querySelector('.ingredient-table-region'); const side = w.querySelector('.side-region'); const log = w.querySelector('.notebook-log'); const sheet = w.querySelector('.recipe-page');
    const R = region.getBoundingClientRect(), S = side.getBoundingClientRect(), L = log.getBoundingClientRect(), Sh = sheet.getBoundingClientRect();
    const tabs = getComputedStyle(w.querySelector('.shell__tabs')).display !== 'none'; const rail = w.querySelector('.shell__rail'); const railW = wd(rail);
    return { cls, h: Math.ceil(sh.getBoundingClientRect().height), docH: Math.round(sh.getBoundingClientRect().height), nav: tabs ? 'bottom tab row' : (railW ? `rail ${Math.round(railW)}` : 'fly-out (closed)'), sheetW: Math.round(Sh.width * 10) / 10, tableW: Math.round(R.width * 10) / 10,
      nameMin: names.length ? Math.round(Math.min(...names.map((n) => n.getBoundingClientRect().width)) * 10) / 10 : 0, maxRows: ls.length ? Math.max(...ls) : 0, wrapped: names.map((n, i) => ls[i]).filter((x) => x > 1),
      balance: S.left >= R.right - 1 ? 'beside' : 'below', logPos: L.left >= Sh.right - 5 ? 'beside' : 'below' };
  }));
  for (const r of res) { const key = r.cls.replace(/^fp-/, '').replace(/-(\d+)$/, '_$1'); heights[key] = r.h + 4; facts[key] = r; }
  await ctx.close();
}
await b.close(); await s.close();
const prevH = JSON.parse(await readFile(path.join(HERE, 'final-heights.json'), 'utf8').catch(() => '{}')); const prevF = JSON.parse(await readFile(path.join(HERE, 'final-board-measure.json'), 'utf8').catch(() => '{}'));
await writeFile(path.join(HERE, 'final-heights.json'), JSON.stringify({ ...prevH, ...heights })); await writeFile(path.join(HERE, 'final-board-measure.json'), JSON.stringify({ ...prevF, ...facts }));
console.log('ok', Object.keys(facts).length);
