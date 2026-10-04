// Sid, 2026-10-04 (decision 34): measures the label-to-info gap in every panel of the two option boards. node info-measure.mjs -> info-measure.json
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const br = await webkit.launch(); const out = {};
for (const f of ['info-labels-bands', 'info-labels-log']) {
  const ctx = await br.newContext({ viewport: { width: 7200, height: 900 }, hasTouch: true }); const p = await ctx.newPage();
  await p.goto(`file://${HERE}/../sketches/011-recipe-route-c/${f}.html`); await p.waitForTimeout(500);
  const r = await p.evaluate(() => { const o = {}; const tr = (e) => { const g = document.createRange(); g.selectNodeContents(e); return Math.max(...[...g.getClientRects()].map((x) => x.right)); }; const tl = (e) => { const g = document.createRange(); g.selectNodeContents(e); return Math.min(...[...g.getClientRects()].map((x) => x.left)); };
    for (const w of document.querySelectorAll('.fp-win')) { const cls = [...w.classList].find((c) => c.startsWith('fp-info-')); const m = cls.match(/fp-info-[^-]+-([^-]+)-\d+/) || cls.match(/fp-info-.*-(today|A|B|C)-\d+/); const opt = cls.match(/-(today|A|B|C)-\d+$/)[1];
      const W = parseInt(w.style.width) ; const real = parseInt(w.querySelector(':scope > div').style.width);
      const set = (k, v) => { if (v != null && !Number.isNaN(v)) o[`${opt}_${real}_${k}`] = v; };
      const hist = [...w.querySelectorAll('.fold-row')].find((e) => /History/.test(e.textContent)); if (hist) set('History', Math.round(tl(hist.querySelector('.fold-row__count')) - tr(hist.querySelector('.fold-row__control'))));
      const j = w.querySelector('.notebook-jump'); if (j && getComputedStyle(j).display !== 'none') set('Go to batch', Math.round(tl(j.querySelector('.notebook-jump__status')) - tr(j.querySelector('.notebook-jump__control'))));
      const h = w.querySelector('.batch-row__head'); if (h) { const l = h.querySelector('.batch-row__head-lead').lastElementChild; const a = h.querySelector('.batch-row__head-acts'); const lr = l.getBoundingClientRect(), ar = a.getBoundingClientRect(); if (ar.top < lr.bottom) set('Batch head', Math.round(tl(a) - tr(l))); }
      const t = [...w.querySelectorAll('.fold-row')].find((e) => /Tasting/.test(e.textContent)); if (t) set('Tasting', Math.round(tl(t.querySelector('.fold-row__count')) - tr(t.querySelector('.fold-row__control')))); }
    return o; });
  Object.assign(out, r); await ctx.close();
}
await br.close(); await writeFile(path.join(HERE, 'info-measure.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); process.exit(0);
