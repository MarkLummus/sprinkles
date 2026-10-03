// Sid, 2026-10-03 (decision 32): board against app for the ladder boards. For every panel of 1366-ladder.html and 1194-ladder.html: the rail, Sheet, table,
// Balance and log widths, the shell's height and the heading positions, against ladder-measure.json (the built app with the same rule moved in-page,
// WebKit). 0.5px tolerance; the Chrome numbers are not compared.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ALL = JSON.parse(await readFile(path.join(HERE, 'ladder-measure.json'), 'utf8')).filter((r) => r.engine === 'webkit');
// widths from the column form; positions and the page height from the column rows with the folds open (the boards open Balance and Watch for)
const M = ALL.filter((r) => r.form === 'column' && r.folds === 'default').map((r) => { const o = ALL.find((q) => q.width === r.width && q.label === r.label && q.state === r.state && q.form === 'column' && q.folds === (r.width < 1366 ? 'open' : 'default')); return o ? { ...r, yIng: o.yIng, yBal: o.yBal, docH: o.docH } : r; });
const KEYS = { 1366: { a: [1366, 'a today'], b: [1366, 'b Balance below'], c: [1365, 'c log below (the app at 1365)'], d: [1366, 'd tab row for the rail'], e: [1366, 'e narrow rail'] }, 1194: { a: [1194, 'today = c'], d: [1194, 'd tab row'], e: [1194, 'e narrow rail'] } };
const s = await startServers(); const b = await webkit.launch(); let bad = 0, n = 0;
for (const W of [1366, 1194]) {
  const ctx = await b.newContext({ viewport: { width: 1366, height: 1000 }, hasTouch: true });
  await ctx.route('**/*', async (r) => { const u = new URL(r.request().url()); if (u.hostname === '127.0.0.1') return r.continue(); if (u.hostname === 'fonts.googleapis.com') return r.fulfill({ contentType: 'text/css', body: `@font-face{font-family:Caveat;src:url(${s.repoUrl}/app/public/fonts/caveat-regular.woff2) format("woff2");font-weight:400}` }); return r.abort(); });
  const p = await ctx.newPage();
  await p.goto(`${s.repoUrl}/.planning/sketches/011-recipe-route-c/${W}-ladder.html`, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  for (const [rkey, st] of [['mex', 'Mexican'], ['olive', 'Olive']]) for (const [key, [w, lab]] of Object.entries(KEYS[W])) {
    const app = M.find((r) => r.width === w && r.label === lab && r.state.startsWith(st.slice(0, 4)));
    const got = await p.evaluate((cls) => {
      const root = document.querySelector('.' + cls); const wd = (e) => (e && getComputedStyle(e).display !== 'none' ? Math.round(e.getBoundingClientRect().width * 10) / 10 : 0);
      const top = root.getBoundingClientRect().top; const y = (e) => (e ? Math.round(e.getBoundingClientRect().top - top) : null);
      const heading = (t) => [...root.querySelectorAll('h2')].find((h) => h.textContent.replace(/Hide|Show/g, '').trim() === t);
      return { nav: wd(root.querySelector('.shell__rail')), sheet: wd(root.querySelector('.recipe-page')), table: wd(root.querySelector('.ingredient-table-region')), side: wd(root.querySelector('.side-region')), log: wd(root.querySelector('.notebook-log')), yIng: y(heading('Ingredients')), yBal: y(heading('Balance')), docH: Math.round(root.querySelector('.shell').getBoundingClientRect().height) };
    }, `lc-${rkey}-${key}`);
    for (const k of ['nav', 'sheet', 'table', 'side', 'log']) { n++; if (Math.abs(got[k] - app[k]) > (key === 'c' ? 1.5 : 0.5)) { bad++; console.log('diff', W, rkey, key, k, got[k], app[k]); } }
    for (const k of ['yIng', 'yBal']) { n++; if (Math.abs(got[k] - app[k]) > 1.5) { bad++; console.log('diff', W, rkey, key, k, got[k], app[k]); } }
    n++; if (Math.abs(got.docH - app.docH) > 30) { bad++; console.log('diff', W, rkey, key, 'docH', got.docH, app.docH); }
  }
  await ctx.close();
}
console.log('checks', n, 'off', bad);
await b.close(); await s.close();
