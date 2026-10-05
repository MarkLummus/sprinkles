// Sid, 2026-10-04 (decision 45): captures the built app's whole shell at letter width (816) for the print page-break boards.
//   node breaks-capture.mjs   -> breaks-capture.json (keys state_816)
// WebKit, coarse pointer, read from the preview server already on 127.0.0.1:4173 (the dist after quick 261004-ly8); no server is started here. Olive Oil v1 (the only seeded version with notes, and a formula that
// does not fit one page under "Before you start"), Mexican Chocolate v3 (one step group of twelve rows, no notes) and Standard Base v2 (no steps at all: a flat table).
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const R = { olive1v: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3', base2: '/notebook/standard-base/standard-base-v2' };
const browser = await webkit.launch(); const out = {};
for (const s of Object.keys(R)) {
  const ctx = await browser.newContext({ viewport: { width: 816, height: 1000 }, hasTouch: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); page.setDefaultTimeout(10000);
  await page.goto('http://127.0.0.1:4173' + R[s], { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table'); await page.waitForTimeout(300);
  out[`${s}_816`] = await page.evaluate(async () => { await document.fonts.ready; return document.querySelector('.shell').outerHTML; });
  await ctx.close();
}
await browser.close();
await writeFile(path.join(HERE, 'breaks-capture.json'), JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => k + ' ' + v.length).join('\n')); process.exit(0);
