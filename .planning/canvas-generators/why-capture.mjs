// Sid, 2026-10-04 (decision 37): captures the built app's whole shell for the Why-row boards, version details open.
//   node why-capture.mjs   -> why-capture.json (keys state_W)
// WebKit, the dist of 2026-10-04, throwaway 127.0.0.1 servers. 1600 fine pointer; 1366 and 393 coarse (the iPad and the phone). Folds as the app opens them, then Show details clicked where it is closed.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const R = { mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3', mex2: '/notebook/mexican-chocolate/mexican-chocolate-v2', olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1' };
const SPECS = []; for (const W of [1600, 1366, 393]) for (const s of Object.keys(R)) SPECS.push([s, W]);
const servers = await startServers(); const browser = await webkit.launch(); const out = {};
for (const [state, W] of SPECS) {
  const coarse = W <= 1366;
  const ctx = await browser.newContext({ viewport: { width: W, height: 1000 }, hasTouch: coarse, deviceScaleFactor: 1 });
  await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage(); page.setDefaultTimeout(10000);
  await page.goto(servers.appUrl + R[state], { waitUntil: 'networkidle' }); await page.waitForSelector('.notebook-version__details', { state: 'attached' });
  if (!(await page.locator('.notebook-version__details').isVisible())) { await page.getByRole('button', { name: /Show details/ }).first().click(); await page.waitForTimeout(200); }
  await page.waitForTimeout(150);
  out[`${state}_${W}`] = await page.evaluate(async () => { await document.fonts.ready; return document.querySelector('.shell').outerHTML; });
  await ctx.close();
}
await browser.close(); await servers.close();
await writeFile(path.join(HERE, 'why-capture.json'), JSON.stringify(out));
console.log(Object.keys(out).join(' ')); process.exit(0);
