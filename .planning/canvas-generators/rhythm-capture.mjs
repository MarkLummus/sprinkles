// Sid, 2026-10-04 (decision 39): captures the built app's whole shell for the Version-details rhythm board, details open.
//   node rhythm-capture.mjs   -> rhythm-capture.json (keys state_W)
// WebKit, read from the preview server already on 127.0.0.1:4173 (the dist of 2026-10-04, after quick 261004-ly6: the saved Why in the hand, flush with its label); no server is started here.
// 1600 fine pointer; 1366 and 393 coarse (the iPad and the phone). Details closed below 1366 as the app opens them, then Show details clicked.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const R = { mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3', mex2: '/notebook/mexican-chocolate/mexican-chocolate-v2', olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1' };
const SPECS = []; for (const W of [1600, 1366, 393]) for (const s of Object.keys(R)) SPECS.push([s, W]);
const browser = await webkit.launch(); const out = {};
for (const [state, W] of SPECS) {
  const coarse = W <= 1366;
  const ctx = await browser.newContext({ viewport: { width: W, height: 1000 }, hasTouch: coarse, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); page.setDefaultTimeout(10000);
  await page.goto('http://127.0.0.1:4173' + R[state], { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-version__details', { state: 'attached' });
  if (!(await page.locator('.notebook-version__details').isVisible())) { await page.getByRole('button', { name: /Show details/ }).first().click(); await page.waitForTimeout(200); }
  await page.waitForTimeout(150);
  out[`${state}_${W}`] = await page.evaluate(async () => { await document.fonts.ready; return document.querySelector('.shell').outerHTML; });
  await ctx.close();
}
await browser.close();
await writeFile(path.join(HERE, 'rhythm-capture.json'), JSON.stringify(out));
console.log(Object.keys(out).join(' ')); process.exit(0);
