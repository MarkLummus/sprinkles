// Sid, 2026-10-04 (decision 35): captures the built app's whole shell with Next version open on Olive Oil v1, the Sheet title unchanged and changed. node title-capture.mjs -> title-capture.json
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { startServers } from '../phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OLIVE = '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89';
const SHORT = 'Olive Oil Ice Cream, lighter', LONG = 'Olive Oil Ice Cream with a much longer title that goes on and on';
const SPECS = [[393, 'same'], [393, 'short'], [393, 'long'], [1366, 'same'], [1366, 'short'], [1600, 'same'], [1600, 'short']];
const s = await startServers(); const br = await webkit.launch(); const out = {}, geo = {};
for (const [W, st] of SPECS) {
  const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: W <= 1366, deviceScaleFactor: 1 }); await ctx.route('**/*', (r) => (new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort()));
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto(s.appUrl + OLIVE, { waitUntil: 'networkidle' }); await p.waitForSelector('.shell'); await p.evaluate(() => document.fonts.ready);
  await p.getByRole('button', { name: 'Next version' }).first().click(); await p.getByLabel('Sheet title', { exact: true }).waitFor();
  if (st !== 'same') await p.getByLabel('Sheet title', { exact: true }).fill(st === 'short' ? SHORT : LONG);
  await p.waitForTimeout(150);
  out[`tt_${st}_${W}`] = await p.evaluate(() => document.querySelector('.shell').outerHTML);
  geo[`tt_${st}_${W}`] = await p.evaluate(() => { const s = document.querySelector('.shell').getBoundingClientRect(); const h = document.querySelector('.headnote').getBoundingClientRect(); return { x: Math.round(h.x - s.x), y: Math.round(h.y - s.y), w: Math.round(h.width), h: Math.round(h.height) }; });
  await ctx.close();
}
await br.close(); await s.close(); await writeFile(path.join(HERE, 'title-capture.json'), JSON.stringify({ html: out, geo, SHORT, LONG })); console.log(JSON.stringify(geo)); process.exit(0);
