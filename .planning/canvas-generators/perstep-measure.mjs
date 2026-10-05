// Sid, 2026-10-05 (decision 51): measures the per-step probe board, one panel at a time, for the crops.
//   node perstep-measure.mjs <path to R35C_PerStepProbe.dc.html>  -> perstep-measure.json  { pid: { region, top: {y,h} (the first step head's top to the last Sucrose line's bottom), full: {y,h} (to the Total row's bottom) } }
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const probe = process.argv[2];
const br = await webkit.launch(); const ctx = await br.newContext({ viewport: { width: 1700, height: 900 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto('file://' + probe); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
const pids = await p.evaluate(() => [...document.querySelectorAll('[data-pid]')].map((w) => w.dataset.pid)); const out = {};
for (const pid of pids) {
  out[pid] = await p.evaluate((pid) => {
    for (const w of document.querySelectorAll('[data-pid]')) w.style.display = w.dataset.pid === pid ? 'block' : 'none';
    const w = document.querySelector(`[data-pid="${pid}"]`); const wr = w.getBoundingClientRect(); const R = (e) => { const b = e.getBoundingClientRect(); return { x: +(b.x - wr.x).toFixed(1), y: +(b.y - wr.y).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
    const reg = w.querySelector('[data-m="region"]'); const a = R(w.querySelector('[data-m="a"]')), z = R(w.querySelector('[data-m="z"]')), t = R(w.querySelector('[data-m="t"]'));
    return { region: R(reg), top: { y: a.y, h: +(z.y + z.h - a.y).toFixed(1) }, full: { y: a.y, h: +(t.y + t.h - a.y).toFixed(1) } };
  }, pid);
}
await br.close(); await writeFile(path.join(HERE, 'perstep-measure.json'), JSON.stringify(out, null, 1)); console.log(Object.keys(out).length, 'panels'); process.exit(0);
