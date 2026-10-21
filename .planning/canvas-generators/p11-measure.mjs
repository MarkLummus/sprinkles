// Sid, 2026-10-21 (Phase 11 design gate): measures each panel's natural height for p11.py (a copy of p10-measure.mjs with its own output files).
//   node p11-measure.mjs <measure.html>  -> p11-measure.json  {pid: height}
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(process.argv[2]);
const b = await webkit.launch();
const ctx = await b.newContext({ viewport: { width: 1500, height: 1000 }, hasTouch: true });
const p = await ctx.newPage();
await p.goto('file://' + file); await p.waitForTimeout(500); await p.evaluate(() => document.fonts.ready);
const out = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-pid]')].map((e) => [e.dataset.pid, Math.ceil(e.querySelector('.inner').getBoundingClientRect().height)])));
const boxes = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-pid]')].map((e) => { const r0 = e.getBoundingClientRect(); const bal = e.querySelector('.formulation-note-region'); const b = bal ? bal.getBoundingClientRect() : null; return [e.dataset.pid, b ? { balY: Math.floor(b.top - r0.top), balH: Math.ceil(b.height), balX: Math.floor(b.left - r0.left), balW: Math.ceil(b.width) } : null]; })));
await writeFile(path.join(HERE, 'p11-boxes.json'), JSON.stringify(boxes, null, 1));
await writeFile(path.join(HERE, 'p11-measure.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out)); await b.close(); process.exit(0);
