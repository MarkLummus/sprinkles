// Sid, 2026-10-05 (decision 49): captures the built app's whole shell for the empty-space boards: Mexican Chocolate v3 with its batch as the app opens it (Show changes off; As made as seeded), at 1024 and 1366 (coarse pointer),
// with Balance and Watch for open (the default from 984) and with Watch for closed (a tap on its Hide).   node empty-capture.mjs -> empty-capture.json (keys open_W, closed_W)   (WebKit; the preview server on 127.0.0.1:4173)
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const URL_ = '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01';
const br = await webkit.launch(); const out = {};
for (const W of [1024, 1366]) for (const state of ['open', 'closed']) {
  const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4173' + URL_, { waitUntil: 'networkidle' }); await p.waitForSelector('.ingredient-table');
  if (state === 'closed') { const b = p.locator('.margin-region button[aria-expanded="true"]').first(); await b.click(); await p.waitForTimeout(200); }
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
  out[`${state}_${W}`] = await p.evaluate(() => document.querySelector('.shell').outerHTML); await ctx.close();
}
await br.close(); await writeFile(path.join(HERE, 'empty-capture.json'), JSON.stringify(out)); console.log(Object.entries(out).map(([k, v]) => k + ' ' + v.length).join('\n'));
