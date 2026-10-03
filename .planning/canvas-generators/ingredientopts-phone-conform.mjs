// Sid, 2026-10-03: board against app for the phone boards redrawn for D3 (decision 31): 393-show-changes, 723-show-changes, 393-pen-changes,
// 723-pen-changes and the "Changes shown" panel of 393-show-changes-head and 723-show-changes-head, against the built app with the P3 rules
// injected in-page, per laid-out cell (0.5px; display:none cells skipped), WebKit and Chrome. 393 is read with a coarse pointer, 723 with a fine one.
//   node ingredientopts-phone-conform.mjs
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers, launch } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const opt = await readFile(path.join(HERE, 'ingredient-options.css'), 'utf8');
const P3 = opt.match(/\/\* === P3 ===[^*]*\*\/([\s\S]*?)(?=\/\* === |$)/)[1];
const MEX4 = '/notebook/mexican-chocolate/mexican-chocolate-v4';
const COC2 = '/notebook/coconut/coconut-v2';
const showChanges = async (p) => { await p.getByRole('button', { name: 'Show changes' }).first().click(); await p.getByRole('button', { name: 'Hide changes' }).first().waitFor(); };
const pen = async (p) => { await p.getByRole('button', { name: 'Next version' }).first().click(); await p.getByLabel('Salt, grams', { exact: true }).waitFor();
  for (const [l, v] of [['Whole Milk 3.3%', '600'], ['Sucrose', '36'], ['Cocoa Powder', '45']]) await p.getByLabel(l + ', grams', { exact: true }).fill(v);
  await p.locator('tr', { hasText: 'Cinnamon' }).getByRole('button', { name: 'remove' }).click(); };
const CASES = [
  { file: '393-show-changes.html', width: 393, coarse: true, route: MEX4, prep: showChanges, nth: 0 },
  { file: '723-show-changes.html', width: 723, coarse: false, route: MEX4, prep: showChanges, nth: 0 },
  { file: '393-pen-changes.html', width: 393, coarse: true, route: MEX4, prep: pen, nth: 0 },
  { file: '723-pen-changes.html', width: 723, coarse: false, route: MEX4, prep: pen, nth: 0 },
  { file: '393-show-changes-head.html', width: 393, coarse: true, route: COC2, prep: showChanges, nth: 1, boardWidth: 1339 },
  { file: '723-show-changes-head.html', width: 723, coarse: false, route: COC2, prep: showChanges, nth: 1, boardWidth: 2329 },
];
const s = await startServers();
const rd = (nth) => { const t = document.querySelectorAll('.ingredient-table')[nth]; const o = t.getBoundingClientRect(); return [...t.querySelectorAll('tr')].map((tr) => ({ t: tr.textContent.replace(/\s+/g, ' ').trim().slice(0, 30), cells: [...tr.children].map((c) => { const b = c.getBoundingClientRect(); return [b.left - o.left, b.top - o.top, b.width, b.height].map((x) => Math.round(x * 10) / 10); }) })); };
let bad = 0, total = 0;
for (const [en, mk] of [['webkit', () => webkit.launch()], ['chrome', () => launch()]]) {
  const b = await mk();
  for (const C of CASES) {
    const ctx = await b.newContext({ viewport: { width: C.width, height: 1100 }, hasTouch: C.coarse });
    await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
    const p = await ctx.newPage();
    await p.goto(s.appUrl + C.route, { waitUntil: 'networkidle' }); await p.waitForSelector('.ingredient-table');
    await C.prep(p); await p.addStyleTag({ content: P3 }); await p.waitForTimeout(80);
    const ap = await p.evaluate(rd, 0); await ctx.close();
    const ctx2 = await b.newContext({ viewport: { width: C.boardWidth || C.width, height: 1100 }, hasTouch: C.coarse });
    await ctx2.route('**/*', async (r) => { const u = new URL(r.request().url()); if (u.hostname === '127.0.0.1') return r.continue(); if (u.hostname === 'fonts.googleapis.com') return r.fulfill({ contentType: 'text/css', body: `@font-face{font-family:Caveat;src:url(${s.repoUrl}/app/public/fonts/caveat-regular.woff2) format("woff2");font-weight:400}` }); return r.abort(); });
    const q = await ctx2.newPage();
    await q.goto(`${s.repoUrl}/.planning/sketches/011-recipe-route-c/${C.file}`, { waitUntil: 'networkidle' }); await q.evaluate(() => document.fonts.ready);
    let bd = await q.evaluate(rd, C.nth); await ctx2.close();
    // the head boards' Coconut capture predates quick task 261002-wdn, which hides a lone Unallocated step head; the board still draws it, so compare without it and without the y that it shifts
    const skipY = !!C.boardWidth; if (skipY) bd = bd.filter((r) => !/Unallocated/.test(r.t));
    let mism = 0; if (ap.length !== bd.length) mism += 1000;
    ap.forEach((r, k) => { const o = bd[k]; if (!o) return; if (r.cells.length !== o.cells.length) { mism++; return; } r.cells.forEach((c, m) => { const e = o.cells[m]; if (c[2] === 0 && c[3] === 0 && e[2] === 0 && e[3] === 0) return; total++; if (c.some((v, z) => !(skipY && z === 1) && Math.abs(v - e[z]) > 0.5)) { mism++; if (mism < 4) console.log('  diff', en, C.file, r.t, m, c, e); } }); });
    console.log(en, C.file, 'rows', ap.length, 'board rows', bd.length, 'mismatches', mism); bad += mism;
  }
  await b.close();
}
console.log('total laid-out cells', total, 'mismatches', bad);
await s.close();
