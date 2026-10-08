// Sid, 2026-10-07 (row draw-method-print-treatment, D18): measures the drawn method. node method-measure.mjs <dir holding method-probe.html and method-asbuilt-probe.html>
//   For WebKit (coarse pointer) and Chromium: each step's height and the heading's at the content widths 672 (Chrome) and 630 (Safari), 0.75 in at both sides (D20), and 696 and 652 (D16's 0.5 in at the right), the whole list's height, whether any line
//   overflows its column, the smallest type, the colours; the pages whole steps make at 960 (Chrome) and 900 (Safari) px, by the same greedy rule as method.py; the as-built panel's height at 816.
//   Writes method-measure.json (chrome_heights = the taller of the two engines at 696, head, asbuilt_h) which method.py reads for its pagination.
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const DIR = path.resolve(process.argv[2]);
const engines = { webkit: await webkit.launch(), chromium: await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) };
const GAP = 20;
const paginate = (hs, limit, head) => { const pages = [[]]; let used = head; const bottoms = []; hs.forEach((h, i) => { const add = h + (pages.at(-1).length ? GAP : 0); if (used + add > limit && pages.at(-1).length) { bottoms.push(Math.round(used)); pages.push([]); used = 0; } used += pages.at(-1).length ? add : h; pages.at(-1).push(i); }); bottoms.push(Math.round(used)); return { pages: pages.map((p) => (p.length ? `${p[0] + 1}-${p.at(-1) + 1}` : '')), used: bottoms }; };
const res = {};
for (const [name, br] of Object.entries(engines)) {
  const ctx = await br.newContext({ viewport: { width: 1000, height: 1400 }, hasTouch: name === 'webkit', deviceScaleFactor: 1 }); const page = await ctx.newPage(); await page.emulateMedia({ media: 'print' });
  await page.goto('file://' + path.join(DIR, 'method-probe.html')); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
  for (const [k, W] of [['chrome', 672], ['safari', 630], ['chrome-d16', 696], ['safari-d16', 652]]) {
    res[name + '_' + k] = await page.evaluate((W) => {
      const all = document.getElementById('all'); all.style.width = W + 'px'; const steps = [...all.querySelectorAll('.mp-step')]; const r = (e) => e.getBoundingClientRect();
      const fs = [...all.querySelectorAll('*')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize));
      const cols = [...new Set([...all.querySelectorAll('*')].flatMap((e) => { const s = getComputedStyle(e); return [s.color, s.borderLeftColor, s.textDecorationColor].filter((c) => c && c !== 'rgba(0, 0, 0, 0)'); }))];
      const A = r(all); const hd = document.getElementById('head');
      return { heights: steps.map((s) => Math.round(r(s).height * 10) / 10), head: Math.round(r(hd).height + parseFloat(getComputedStyle(hd).marginBottom)), listH: Math.round(r(all).height), ox: all.scrollWidth - all.clientWidth,
        over: [...all.querySelectorAll('*')].filter((e) => r(e).right > A.right + 0.5).length, minFont: Math.min(...fs), colours: cols, numX: Math.round(r(steps[0].querySelector('.mp-n')).left - A.left), textX: Math.round(r(steps[0].querySelector('.mp-lead')).left - A.left) };
    }, W);
  }
  const p2 = await ctx.newPage(); await p2.emulateMedia({ media: 'print' }); await p2.goto('file://' + path.join(DIR, 'method-asbuilt-probe.html')); await p2.evaluate(() => document.fonts.ready); await p2.waitForTimeout(300);
  res[name + '_asbuilt'] = await p2.evaluate(() => ({ docH: Math.round(document.querySelector('article.recipe-page').getBoundingClientRect().bottom), region: Math.round(document.querySelector('.method-region').getBoundingClientRect().height), regionW: Math.round(document.querySelector('.method-region').getBoundingClientRect().width) }));
  await ctx.close();
}
await engines.webkit.close(); await engines.chromium.close();
for (const [k, lim] of [['chrome', 960], ['safari', 900], ['chrome-d16', 960], ['safari-d16', 900]]) {
  const hs = res.webkit_chrome.heights.map((_, i) => Math.max(res['webkit_' + k].heights[i], res['chromium_' + k].heights[i])); const head = Math.max(res['webkit_' + k].head, res['chromium_' + k].head);
  res['pages_' + k] = { ...paginate(hs, lim, head), heights: hs, total: Math.round(hs.reduce((a, b) => a + b, 0) + GAP * 9 + head) };
}
res.chrome_heights = res.pages_chrome.heights; res.head = Math.max(res.webkit_chrome.head, res.chromium_chrome.head); res.asbuilt_h = Math.ceil(Math.max(res.webkit_asbuilt.docH, res.chromium_asbuilt.docH) / 10) * 10 + 10;
await writeFile(path.join(HERE, 'method-measure.json'), JSON.stringify(res, null, 1));
for (const k of Object.keys(res)) if (k.startsWith('pages_')) console.log(k, JSON.stringify(res[k])); else if (!['chrome_heights', 'head', 'asbuilt_h'].includes(k)) console.log(k, JSON.stringify(res[k]).slice(0, 600));
console.log('head', res.head, 'asbuilt_h', res.asbuilt_h); process.exit(0);
