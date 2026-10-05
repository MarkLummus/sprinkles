// Sid, 2026-10-05 (decision 49): the empty-space board against the build with each option added: for each panel, the boxes of the Sheet's grid (page, table region, table, Instructions, side column and its two sections, from the Ingredients heading's top)
// in the board and in the build (the same page, A's rule injected, Watch for closed for AB), in WebKit, coarse pointer.   node empty-conform.mjs <dir holding empty-space-under-table.html>   -> "checks N off M"
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const DIR = process.argv[2]; const URL_ = 'http://127.0.0.1:4173/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const A = '.recipe-page{grid-template-rows:auto auto 1fr auto}.recipe-page--no-method{grid-template-rows:auto 1fr auto}';
const SEL = ['.recipe-page', '.ingredient-table-region', '.ingredient-table', '.method-region', '.side-region', '.formulation-note-region', '.margin-region', '.method-region > *'];
const measure = ([SEL, root]) => { const sh = document.querySelector(root).getBoundingClientRect(); const reg = document.querySelector(root + ' .ingredient-table-region').getBoundingClientRect(); const o = {};
  for (const s of SEL) o[s] = [...document.querySelectorAll(root + ' ' + s)].slice(0, 6).map((e) => { const b = e.getBoundingClientRect(); return [+(b.x - sh.x).toFixed(1), +(b.y - reg.y).toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; }); return o; };
const br = await webkit.launch(); let n = 0, bad = 0;
for (const [vk, state] of [['built', 'open'], ['A', 'open'], ['AB', 'closed']]) for (const W of [1024, 1366]) {
  const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: true }); const p = await ctx.newPage();
  await p.goto(URL_, { waitUntil: 'networkidle' }); await p.waitForSelector('.ingredient-table'); await p.evaluate(() => document.fonts.ready);
  if (vk !== 'built') await p.addStyleTag({ content: '@media (min-width:984px){' + A + '}' });
  if (state === 'closed') await p.locator('.margin-region button[aria-expanded="true"]').first().click(); await p.waitForTimeout(200);
  const app = await p.evaluate(measure, [SEL, '.shell']); await ctx.close();
  const bctx = await br.newContext({ viewport: { width: 2600, height: 1000 }, hasTouch: true });
  await bctx.route('**/caveat-regular.woff2', (r) => r.fulfill({ path: '/Users/mark/Documents/projects/sprinkles/app/public/fonts/caveat-regular.woff2', contentType: 'font/woff2' })); await bctx.route(/fonts\.googleapis/, (r) => r.fulfill({ contentType: 'text/css', body: '' }));
  const bp = await bctx.newPage(); await bp.goto('file://' + path.join(DIR, 'empty-space-under-table.html')); await bp.waitForTimeout(900); await bp.evaluate(() => document.fonts.ready);
  const brd = await bp.evaluate(measure, [SEL, `.fp-win.fp-em-${vk}-${W} .shell`]); await bctx.close();
  for (const s of SEL) { const a = app[s], b = brd[s]; n++; if (a.length !== b.length) { bad++; console.log('count', vk, W, s, a.length, b.length); continue; }
    a.forEach((ea, i) => ea.forEach((va, j) => { n++; if (Math.abs(va - b[i][j]) > 0.6) { bad++; console.log('diff', vk, W, s + '[' + i + ']', 'xywh'[j], 'app', va, 'board', b[i][j]); } })); }
}
console.log('checks', n, 'off', bad); await br.close(); process.exit(0);
