// Sid, 2026-10-07 (row draw-hole-punch-left-margin, D16): the Sheet board (Balance in column 2) at the content widths the new margin gives it, in WebKit (coarse pointer) and Chromium:
//   chrome 696 and safari 652 (0.75 in left, 0.5 in right); safari-sym 630 and chrome-sym 672 (0.75 in at both sides); chrome-old 720 and safari-old 675 (the margins it was approved at).
//   node sheetfit-measure.mjs <dir holding PrintStartingPointBalanceCol2.dc.html>   (the dir printstart.py wrote, /project)
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const DIR = path.resolve(process.argv[2]); const FILE = process.argv[3] || 'PrintStartingPointBalanceCol2.dc.html';
const FONT = path.join(HERE, '..', '..', 'app', 'public', 'fonts', 'caveat-regular.woff2');
const h = (await readFile(path.join(DIR, FILE), 'utf8')).replace('<script src="./support.js"></script>', '').replaceAll('/_blob/37ac467ba5558024f5fb5a2e5c22a7bc', 'file://' + FONT);
await writeFile(path.join(DIR, '_fit-' + FILE), h);
const engines = { webkit: await webkit.launch(), chromium: await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }) };
const CASES = [['safari', 630, 72, 72], ['chrome', 672, 72, 72], ['safari-d16', 652, 72, 48], ['chrome-d16', 696, 72, 48]];
for (const [n, br] of Object.entries(engines)) {
  const ctx = await br.newContext({ viewport: { width: 900, height: 1200 }, hasTouch: n === 'webkit', deviceScaleFactor: 1 }); const page = await ctx.newPage(); await page.emulateMedia({ media: 'print' });
  await page.goto('file://' + path.join(DIR, '_fit-' + FILE)); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
  const out = {};
  for (const [k, cw, pl, pr] of CASES) {
    out[k] = await page.evaluate(([cw, pl, pr]) => {
      const a = document.querySelector('article.recipe-page'); a.style.paddingLeft = pl + 'px'; a.style.paddingRight = pr + 'px'; a.style.width = (getComputedStyle(a).boxSizing === 'border-box' ? cw + pl + pr : cw) + 'px';
      const t = a.querySelector('.ingredient-table'); const side = a.querySelector('.side-region'); const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; };
      const rows = [...t.querySelectorAll('tbody tr[aria-label]')]; const wraps = rows.filter((r) => { const c = r.querySelector('.ingredient-table__col-name'); const g = document.createRange(); g.selectNodeContents(c); return g.getClientRects().length > 1; }).length;
      const over = [...a.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > a.getBoundingClientRect().right - pr + 0.5; }).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]).slice(0, 5);
      const steps = [...a.querySelectorAll('.method-step')].map((e) => Math.round(e.getBoundingClientRect().height));
      return { cw, ox: a.scrollWidth - a.clientWidth, table: box(t), side: box(side), nameWraps: wraps, over, articleH: Math.round(a.getBoundingClientRect().height), methodH: box(a.querySelector('.method-region'))[1], steps: steps.slice(0, 4), stepsMax: Math.max(...steps) };
    }, [cw, pl, pr]);
  }
  console.log(n, JSON.stringify(out)); await ctx.close();
}
await engines.webkit.close(); await engines.chromium.close(); process.exit(0);
