// Sid, 2026-10-04 (decision 38): measures the App-radius probe board (every panel at natural size) for the crops and the captions' numbers.
//   node radius-measure.mjs <path to R35C_WhyProbe.dc.html>  -> radius-measure.json  { pid: { marker: {x,y,w,h}, ... } }   (WebKit)
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const probe = process.argv[2];
const br = await webkit.launch(); const ctx = await br.newContext({ viewport: { width: 1700, height: 900 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto('file://' + probe); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
const r = await p.evaluate(() => { const out = {}; for (const w of document.querySelectorAll('[data-pid]')) { const sh = w.querySelector('.shell').getBoundingClientRect(); const o = {};
  for (const el of w.querySelectorAll('[data-m]')) { const b = el.getBoundingClientRect(); o[el.dataset.m] = { x: +(b.x - sh.x).toFixed(1), y: +(b.y - sh.y).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; }
  out[w.dataset.pid] = o; } return out; });
await br.close(); await writeFile(path.join(HERE, 'radius-measure.json'), JSON.stringify(r, null, 1)); console.log(Object.keys(r).length, 'panels'); process.exit(0);
