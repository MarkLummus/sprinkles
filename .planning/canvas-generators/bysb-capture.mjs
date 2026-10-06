// Sid, 2026-10-06 (decision 36, the placement B redraw): captures the built app's whole shell for the placement B boards of "Before you start" (states, heading, pen), the same cases as bys-capture.mjs
// on the dist of 2026-10-06 00:13, which carries decisions 48 and 49 (the one-line head, the Instructions row's 1fr). Reading and pen, with and without notes and steps.
//   node bysb-capture.mjs   -> bysb-capture.json (keys state_W)  and bysb-geo.json (the Sheet's own rectangles)
// WebKit, coarse pointer, throwaway 127.0.0.1 servers (the harness's own ports; :4173 and :8077 are never contacted). Folds as the app opens them at that width.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const R = { olive1v: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89', mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3',
  base2: '/notebook/standard-base/standard-base-v2' };
const SPECS = [];
for (const W of [393, 1366]) for (const s of ['olive1v', 'mex3', 'base2', 'olive1vpen', 'mex3pen', 'base2pen']) SPECS.push([s, W]);
const servers = await startServers(); const browser = await webkit.launch(); const out = {}, geo = {};
for (const [state, W] of SPECS) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 1000 }, hasTouch: W <= 1366, deviceScaleFactor: 1 });
  await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const page = await ctx.newPage(); page.setDefaultTimeout(10000);
  const base = state.replace(/pen$/, '');
  await page.goto(servers.appUrl + R[base], { waitUntil: 'networkidle' }); await page.waitForSelector('.ingredient-table, .recipe-page');
  if (state.endsWith('pen')) { await page.getByRole('button', { name: 'Next version' }).first().click(); await page.waitForSelector('.recipe-page'); await page.waitForTimeout(250); }
  await page.waitForTimeout(150);
  out[`${state}_${W}`] = await page.evaluate(async () => { await document.fonts.ready; return document.querySelector('.shell').outerHTML; });
  geo[`${state}_${W}`] = await page.evaluate(() => { const sh = document.querySelector('.shell').getBoundingClientRect(); const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x - sh.x), y: Math.round(b.y - sh.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    return { page: r(document.querySelector('.recipe-page')), table: r(document.querySelector('.ingredient-table-region')), method: r(document.querySelector('.method-region')), before: r(document.querySelector('.method__before')), side: r(document.querySelector('.side-region')), docH: Math.round(document.documentElement.scrollHeight), noMethodClass: document.querySelector('.recipe-page').className }; });
  await ctx.close();
}
await browser.close(); await servers.close();
await writeFile(path.join(HERE, 'bysb-capture.json'), JSON.stringify(out)); await writeFile(path.join(HERE, 'bysb-geo.json'), JSON.stringify(geo, null, 1));
console.log(JSON.stringify(geo, null, 1)); process.exit(0);
