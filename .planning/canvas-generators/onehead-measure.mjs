// Sid, 2026-10-05 (decision 48): measures the ingredients table's head in the build: where the heading's and the head's words start, the head's boxes and its height, with and without a batch.
//   node onehead-measure.mjs [chromium]  -> onehead-measure.json   (WebKit by default, coarse pointer; the preview server on 127.0.0.1:4173, nothing started)
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const eng = process.argv[2] === 'chromium' ? chromium : webkit;
const R = { mex3batch: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01', mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3', olive1batch: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89' };
R.under2 = '/notebook/underbelly-light-base/underbelly-light-base-v2'; R.base2 = '/notebook/standard-base/standard-base-v2'; R.olive1pen = R.olive1batch;
const specs = []; for (const W of [724, 744, 834, 984, 1024, 1366, 1600, 1920]) for (const k of ['mex3batch', 'olive1batch', 'under2', 'base2']) specs.push([k, W]);
specs.push(['olive1pen', 1600], ['olive1pen', 744], ['olive1pen', 1024]);
const br = await eng.launch(eng === chromium ? { channel: 'chrome' } : {}); const out = {};
for (const [k, W] of specs) {
  const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: eng === webkit, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4173' + R[k], { waitUntil: 'networkidle' }); await p.waitForSelector('.ingredient-table');
  if (k === 'olive1pen') { await p.getByRole('button', { name: 'Next version' }).first().click(); await p.getByLabel('Salt, grams', { exact: true }).waitFor().catch(() => {}); await p.waitForTimeout(150); } await p.evaluate(() => document.fonts.ready);
  out[`${k}_${W}`] = await p.evaluate(() => {
    const t = document.querySelector('.ingredient-table'); const reg = t.closest('.ingredient-table-region') || t.parentElement; const r1 = (b) => ({ x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) });
    const textLeft = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); const rs = [...rg.getClientRects()]; return rs.length ? +Math.min(...rs.map((r) => r.left)).toFixed(2) : null; };
    const lines = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); const ys = new Set([...rg.getClientRects()].map((r) => Math.round(r.top))); return ys.size; };
     const h2 = reg.querySelector('h2.region-name');
    const ths = [...t.querySelectorAll('thead th')]; const cs = (e) => getComputedStyle(e);
    const tr = t.querySelector('thead tr'); const row = t.querySelector('tbody tr:not(.ingredient-table__step-head)');
    const nameTd = row.querySelector('.ingredient-table__col-name'); const grid = cs(tr).gridTemplateColumns;
    return { asMade: t.classList.contains('ingredient-table--as-made'), headingText: h2 && h2.textContent.trim(), headingLeft: h2 && textLeft(h2), headingFs: h2 && cs(h2).fontSize, headingChars: h2 && (() => { const n = h2.firstChild; return [...n.textContent].map((c, i) => { const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1); return +rg.getBoundingClientRect().left.toFixed(1); }); })(), headingBox: h2 && r1(h2.getBoundingClientRect()), table: r1(t.getBoundingClientRect()), tr: r1(tr.getBoundingClientRect()), trPad: cs(tr).paddingLeft, trGrid: grid, trRowGap: cs(tr).rowGap,
      ths: ths.map((th) => ({ nat: (() => { const s = document.createElement('span'); s.style.whiteSpace = 'nowrap'; s.style.position = 'absolute'; s.textContent = th.textContent; th.appendChild(s); const w = s.getBoundingClientRect().width; s.remove(); return +w.toFixed(2); })(), text: th.textContent.trim(), cls: th.className, box: r1(th.getBoundingClientRect()), textLeft: textLeft(th), lines: lines(th), width: cs(th).width, gridColumn: cs(th).gridColumn, ta: cs(th).textAlign, whiteSpace: cs(th).whiteSpace, fs: cs(th).fontSize, ls: cs(th).letterSpacing, tt: cs(th).textTransform, lh: cs(th).lineHeight })),
      rowBox: r1(row.getBoundingClientRect()), rowGrid: cs(row).gridTemplateColumns, rowPad: cs(row).paddingLeft, nameTextLeft: textLeft(nameTd), nameBox: r1(nameTd.getBoundingClientRect()), asmCells: [...row.querySelectorAll('.ingredient-table__col-numeric')].map((c) => r1(c.getBoundingClientRect())), planCell: r1(row.querySelector('.ingredient-table__col-grams').getBoundingClientRect()), regionBox: r1(reg.getBoundingClientRect()) };
  });
  await ctx.close();
}
await br.close(); await writeFile(path.join(HERE, process.argv[2] === 'chromium' ? 'onehead-measure-chromium.json' : 'onehead-measure.json'), JSON.stringify(out, null, 1)); console.log(Object.keys(out).length);
