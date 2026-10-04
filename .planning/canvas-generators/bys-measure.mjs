// Sid, 2026-10-04 (decision 36): measures the probe board (every panel at natural size) for the crops of the "Before you start" boards, and the heights the captions quote.
//   node bys-measure.mjs <path to R35C_BysProbe.dc.html>  -> bys-measure.json  { pid: { marker: {x,y,w,h}, ... , '_page': h } }
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const probe = process.argv[2]; const printBoard = process.argv[3];
const br = await webkit.launch(); const ctx = await br.newContext({ viewport: { width: 1500, height: 900 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto('file://' + probe); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
const r = await p.evaluate(() => { const out = {}; for (const w of document.querySelectorAll('[data-pid]')) { const sh = w.querySelector('.shell').getBoundingClientRect(); const o = {};
  for (const el of w.querySelectorAll('[data-m]')) { const b = el.getBoundingClientRect(); o[el.dataset.m] = { x: Math.round(b.x - sh.x), y: Math.round(b.y - sh.y), w: Math.round(b.width), h: Math.round(b.height) }; }
  o._doc = Math.round(w.querySelector('.shell').getBoundingClientRect().height); out[w.dataset.pid] = o; } return out; });
if (printBoard) { await p.goto('file://' + printBoard); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
  r.print = await p.evaluate(() => { const o = {}; for (const w of document.querySelectorAll('.fp-win')) { const cls = [...w.classList].find((c) => c.startsWith('fp-pr-')); if (!cls) continue; const a = w.querySelector('article.recipe-page').getBoundingClientRect(); const pp = w.querySelector('.pp').getBoundingClientRect(); o[cls.replace('fp-', '')] = { content: Math.round(a.height), usable: Math.round(pp.height - 88), over: Math.round(a.bottom - (pp.bottom - 40)) }; } return o; }); }
await br.close(); await writeFile(path.join(HERE, 'bys-measure.json'), JSON.stringify(r, null, 1)); console.log(Object.keys(r).length, 'panels'); process.exit(0);
