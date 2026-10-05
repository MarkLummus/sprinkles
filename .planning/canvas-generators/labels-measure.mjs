// Sid, 2026-10-04 (decision 41): measures the small-info-label probe board, one panel at a time, for the crops and the captions' numbers.
//   node labels-measure.mjs <path to R35C_InfoPhoneProbe.dc.html>  -> labels-measure.json  { pid: { row: {x,y,w,h}, gap, wrap } }   (WebKit, coarse)
// row: the cropped row's box (y relative to the panel's top); gap: from the right edge of the control word's text (or the date's) to the left edge of the dot (the first glyph of the info), on one line;
// wrap: for the batch head, where the actions sit when they do not fit on the date's line.
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const probe = process.argv[2];
const br = await webkit.launch(); const ctx = await br.newContext({ viewport: { width: 1700, height: 900 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto('file://' + probe); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
const pids = await p.evaluate(() => [...document.querySelectorAll('[data-pid]')].map((w) => w.dataset.pid)); const out = {};
for (const pid of pids) {
  out[pid] = await p.evaluate((pid) => {
    for (const w of document.querySelectorAll('[data-pid]')) w.style.display = w.dataset.pid === pid ? 'block' : 'none';
    const w = document.querySelector(`[data-pid="${pid}"]`); const wr = w.getBoundingClientRect(); const row = w.querySelector('[data-m="row"]'); const rb = row.getBoundingClientRect();
    const tr = (e) => { const g = document.createRange(); g.selectNodeContents(e); return Math.max(...[...g.getClientRects()].map((x) => x.right)); };
    const tl = (e) => { const g = document.createRange(); g.selectNodeContents(e); return Math.min(...[...g.getClientRects()].map((x) => x.left)); };
    const o = { row: { x: +(rb.x - wr.x).toFixed(1), y: +(rb.y - wr.y).toFixed(1), w: +rb.width.toFixed(1), h: +rb.height.toFixed(2) } };
    if (row.classList.contains('fold-row')) { const c = row.querySelector('.fold-row__count'); const ctl = row.querySelector('.fold-row__control'); const before = getComputedStyle(c, '::before').content; o.gap = Math.round(tl(c) - tr(ctl)); }
    else if (row.classList.contains('notebook-jump')) { o.gap = Math.round(tl(row.querySelector('.notebook-jump__status')) - tr(row.querySelector('.notebook-jump__control'))); }
    else if (row.classList.contains('batch-row__head')) { const l = row.querySelector('.batch-row__head-lead').lastElementChild; const a = row.querySelector('.batch-row__head-acts'); const lr = l.getBoundingClientRect(), ar = a.getBoundingClientRect();
      if (ar.top < lr.bottom) o.gap = Math.round(ar.left - tr(l)); else o.wrap = `actions wrap, ${Math.round(ar.top - row.querySelector('.batch-row__head-lead').getBoundingClientRect().bottom)} px under the date's line`; }
    return o;
  }, pid);
}
await br.close(); await writeFile(path.join(HERE, 'labels-measure.json'), JSON.stringify(out, null, 1)); console.log(Object.keys(out).length, 'panels'); process.exit(0);
