// Sid, 2026-10-04 (decision 34): the cases that need a state: Show changes on the Ingredients head (below 724), and the record pen's Tasting head with Remove tasting at its end.
//   node far-end-probe2.mjs -> far-end-probe2.json
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEX = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const HELP = `const R = (e) => e.getBoundingClientRect(); const tr = (e) => { const g = document.createRange(); g.selectNodeContents(e); return Math.max(...[...g.getClientRects()].map((x) => x.right)); }; const tl = (e) => { const g = document.createRange(); g.selectNodeContents(e); return Math.min(...[...g.getClientRects()].map((x) => x.left)); }; const pair = (l, r, row) => ({ left: l.textContent.trim().slice(0, 24), right: r.textContent.trim().slice(0, 24), gap: Math.round(tl(r) - tr(l)), rowW: Math.round(R(row).width) });`;
const servers = await startServers(); const browser = await webkit.launch(); const res = [];
for (const W of [393, 723, 744, 984, 1366, 1600, 1920]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1000 }, hasTouch: W <= 1366 }); await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage(); page.setDefaultTimeout(8000);
  await page.goto(servers.appUrl + MEX, { waitUntil: 'networkidle' }); await page.waitForSelector('.shell'); await page.evaluate(() => document.fonts.ready);
  const out = { W };
  out.showChanges = await page.evaluate(`(() => { ${HELP} const h = document.querySelector('.ingredient-table-region__head'); if (!h) return null; return pair(h.querySelector('.region-name'), h.querySelector('button'), h); })()`).catch((e) => String(e));
  await page.getByRole('button', { name: 'Record another' }).first().click(); await page.waitForTimeout(250);
  const add = page.getByRole('button', { name: /Add tasting/ }); if (await add.count()) { await add.first().click(); await page.waitForTimeout(250); }
  out.tastingHead = await page.evaluate(`(() => { ${HELP} const h = document.querySelector('.tasting-head'); if (!h) return null; return pair(h.querySelector('.region-name'), h.querySelector('.tasting-head__remove'), h); })()`).catch((e) => String(e));
  out.penFoot = await page.evaluate(`(() => { const f = document.querySelector('.pen-foot__controls'); if (!f) return null; const r = f.getBoundingClientRect(); const b = f.querySelector('button').getBoundingClientRect(); return { rowW: Math.round(r.width), firstButtonLeftFromRowLeft: Math.round(b.left - r.left) }; })()`).catch(() => null);
  res.push(out); await ctx.close();
}
await browser.close(); await servers.close(); await writeFile(path.join(HERE, 'far-end-probe2.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); process.exit(0);
