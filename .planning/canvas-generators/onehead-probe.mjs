// Sid, 2026-10-05 (decision 48): tries the one-line head's rule on the built page (WebKit coarse, and Chrome) and reads what moves: the head's boxes, the table, the page.
//   node onehead-probe.mjs [chromium]  -> onehead-probe.json
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const eng = process.argv[2] === 'chromium' ? chromium : webkit;
const R = { mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01', olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89', under2: '/notebook/underbelly-light-base/underbelly-light-base-v2' };
const RULE = process.env.RULE || `@media screen and (min-width: 724px) {
  .ingredient-table thead th { grid-row: 1; white-space: nowrap; width: auto; }
  .ingredient-table--as-made thead th.ingredient-table__col-numeric:not(:last-child) { justify-self: end; }
}`;
const br = await eng.launch(eng === chromium ? { channel: 'chrome' } : {}); const out = {};
for (const [k, W] of [['mex3', 724], ['mex3', 744], ['mex3', 1024], ['mex3', 1366], ['mex3', 1600], ['olive1', 744], ['olive1', 1366], ['olive1', 1600], ['olive1', 1920], ['under2', 1600]]) {
  const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: eng === webkit, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4173' + R[k], { waitUntil: 'networkidle' }); await p.waitForSelector('.ingredient-table'); await p.evaluate(() => document.fonts.ready);
  const read = () => p.evaluate(() => { const t = document.querySelector('.ingredient-table'); const r = (e) => { const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; };
    const tl = (el) => { const g = document.createRange(); g.selectNodeContents(el); const rs = [...g.getClientRects()]; return rs.length ? [+Math.min(...rs.map((q) => q.left)).toFixed(2), +Math.max(...rs.map((q) => q.right)).toFixed(2)] : null; };
    const row = t.querySelector('tbody tr:not(.ingredient-table__step-head)'); const method = document.querySelector('.method-region, [aria-label="Instructions"]');
    return { doc: document.documentElement.scrollHeight, table: r(t), tr: r(t.querySelector('thead tr')), ths: [...t.querySelectorAll('thead th')].map((h) => ({ text: h.textContent.trim(), box: r(h), ink: tl(h) })), row1: r(row), firstFigureInk: tl(row.querySelector('.ingredient-table__col-grams')), nameInk: tl(row.querySelector('.ingredient-table__col-name')), method: method && r(method), side: (() => { const s = document.querySelector('.side-region, .notebook-side'); return s && r(s); })() }; });
  const before = await read(); await p.addStyleTag({ content: RULE }); await p.waitForTimeout(100); const after = await read();
  out[`${k}_${W}`] = { before, after, dTable: +(after.table.h - before.table.h).toFixed(2), dDoc: after.doc - before.doc, dRow1: +(after.row1.y - before.row1.y).toFixed(2) };
  await ctx.close();
}
await br.close(); await writeFile(path.join(HERE, process.argv[2] === 'chromium' ? 'onehead-probe-chromium.json' : 'onehead-probe.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, 'tr', v.before.tr.h, '->', v.after.tr.h, 'dTable', v.dTable, 'dDoc', v.dDoc, 'dRow1', v.dRow1, '|', v.after.ths.map((h) => `${h.text} ${h.box.x}/${h.box.w}/${h.box.h} ink ${h.ink}`).join(' | '));
