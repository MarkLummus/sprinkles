// Sid, 2026-10-04 (decisions 41 to 43): captures the built app's whole shell at the phone widths for the small-info-label boards.
//   node labels-capture.mjs   -> labels-capture.json (keys state_W)
// WebKit, coarse pointer, read from the preview server already on 127.0.0.1:4173 (the dist after quick 261004-ly7); no server is started here. 393 and 723 (below the 724 cut: nothing of decision 34's A is built there),
// 744 and 1366 (above it: A as quick 261004-igr built it). Mexican Chocolate v3 (a parent, a batch awaiting its tasting) and Olive Oil v1 (a tasted batch). Folds as the app opens them.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const R = { mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3', olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1' };
const browser = await webkit.launch(); const out = {};
for (const W of [393, 723, 744, 1366]) for (const s of Object.keys(R)) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); page.setDefaultTimeout(10000);
  await page.goto('http://127.0.0.1:4173' + R[s], { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-log'); await page.waitForTimeout(400);
  out[`${s}_${W}`] = await page.evaluate(async () => { await document.fonts.ready; return document.querySelector('.shell').outerHTML; });
  await ctx.close();
}
await browser.close();
await writeFile(path.join(HERE, 'labels-capture.json'), JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => k + ' ' + v.length).join('\n')); process.exit(0);
