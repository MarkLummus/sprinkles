// Sid, 2026-10-04 (decision 44): captures the built app's whole shell with the Next version pen open on Olive Oil v1, for the split row's remove link boards.
//   node splitlink-capture.mjs   -> splitlink-capture.json (keys state_W)   states: pen (nothing changed), removed (Whole milk's remove pressed on its Step 2 line)
// WebKit, read from the preview server already on 127.0.0.1:4173 (the dist after quick 261004-ly7); no server is started here. 1600 fine pointer; 1366 and 393 coarse. Whole milk (120 g in Step 2, 250.4 g in Step 3)
// and Sucrose (12 g and 64 g) are the two split ingredients of the seeded Olive Oil v1.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const grab = () => { const root = document.querySelector('.shell').cloneNode(true); const live = document.querySelector('.shell');
  const lf = live.querySelectorAll('input, textarea'); const cf = root.querySelectorAll('input, textarea');
  lf.forEach((e, i) => { const c = cf[i]; if (e.tagName === 'TEXTAREA') c.textContent = e.value; else if (e.type === 'radio' || e.type === 'checkbox') { if (e.checked) c.setAttribute('checked', ''); else c.removeAttribute('checked'); } else c.setAttribute('value', e.value); });
  return root.outerHTML; };
const out = {}; const b = await webkit.launch();
for (const [W, coarse] of [[1600, false], [1366, true], [393, true]]) for (const state of ['pen', 'removed']) {
  const ctx = await b.newContext({ viewport: { width: W, height: 1000 }, hasTouch: coarse, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  await p.goto('http://127.0.0.1:4173/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1', { waitUntil: 'networkidle' }); await p.waitForSelector('.notebook-log'); await p.waitForTimeout(300);
  await p.getByRole('button', { name: /next version/i }).first().click(); await p.waitForTimeout(500);
  if (state === 'removed') { await p.locator('tr', { hasText: 'Whole milk' }).first().getByRole('button', { name: 'remove' }).click(); await p.waitForTimeout(300); }
  await p.evaluate(() => document.fonts.ready); out[`${state}_${W}`] = await p.evaluate(grab);
  await ctx.close();
}
await b.close(); await writeFile(path.join(HERE, 'splitlink-capture.json'), JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => k + ' ' + v.length).join('\n')); process.exit(0);
