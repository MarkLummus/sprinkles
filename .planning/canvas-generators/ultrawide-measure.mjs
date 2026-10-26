// Sid, 2026-10-26: measures the two Ultra-wide boards as drawn (WebKit, the board file opened as a page 2600 wide): per panel, the rail, the nav's first link, the content frame and the header's wordmark and tools.
//   node ultrawide-measure.mjs <out dir>/project  -> ultrawide-measure.json (run ultrawide.py again so the labels carry the numbers)
import { writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const DIR = process.argv[2];
const b = await webkit.launch(); const out = {};
for (const key of ['UW_Home', 'UW_Recipe']) {
  const p = await (await b.newContext({ viewport: { width: 2700, height: 1200 } })).newPage();
  await p.goto(pathToFileURL(path.join(DIR, key + '.dc.html')).href); await p.waitForTimeout(500);
  out[key] = await p.evaluate(() => {
    const R = (root, s) => { const el = root.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(), w = root.getBoundingClientRect(); return { l: +(r.left - w.left).toFixed(1), r: +(r.right - w.left).toFixed(1), w: +r.width.toFixed(1) }; };
    const o = {};
    for (const win of document.querySelectorAll('.p4-win')) {
      const vid = [...win.classList].find((c) => /^u[a-z]\d$/.test(c));
      o[vid] = { rail: R(win, '.shell__rail'), nav: R(win, '.shell__rail a'), main: R(win, '.shell__main'), brand: R(win, '.shell__brand'), tools: R(win, '.shell__tools'), body: R(win, '.shell__body'),
        content: R(win, '.notebook') || R(win, '.list-page'), first: R(win, '.notebook-band') || R(win, '.home'), row: R(win, '.home__row'), tally: R(win, '.home__tally'), sheet: R(win, '.recipe-page'), log: R(win, '.notebook-log'), lead: R(win, '.home__lead'),
        headRule: (() => { const h = win.querySelector('.shell__head'); return h ? +h.getBoundingClientRect().width.toFixed(1) : null; })(), overflow: win.scrollWidth > win.clientWidth };
    }
    return o;
  });
  await p.context().close();
}
await b.close(); await writeFile(path.join(HERE, 'ultrawide-measure.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); process.exit(0);
