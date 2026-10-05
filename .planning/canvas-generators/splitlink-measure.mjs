// Sid, 2026-10-04 (decision 44): measures the split-remove-link probe board, one panel at a time, for the crops and the captions' numbers.
//   node splitlink-measure.mjs <path to R35C_SplitRemoveProbe.dc.html>  -> splitlink-measure.json  { pid: { region, crop: {y,h} (the Step 2 head's top to the last Sucrose line's bottom), links: "<n> (words)" } }
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
    const reg = w.querySelector('[data-m="region"]'); const a = w.querySelector('[data-m="a"]'); const z = w.querySelector('[data-m="z"]'); const ar = R(a), zr = R(z);
    const links = [...reg.querySelectorAll('button.text-control')].filter((b) => /^(remove|restore)$/.test(b.textContent.trim())); const wm = [...reg.querySelectorAll('tr')].filter((t) => /Whole milk|Sucrose/.test(t.textContent) && t.querySelector('input'));
    const per = wm.map((t) => (t.querySelector('button.text-control') ? 1 : 0)).join('');
    return { region: R(reg), crop: { y: ar.y, h: +(zr.y + zr.h - ar.y).toFixed(1) }, links: `${links.length} in the table; on the split lines (Whole milk step 2, Sucrose step 2, Whole milk step 3, Sucrose step 3): ${per.split('').map((c) => (c === '1' ? 'yes' : 'no')).join(', ')}` };
  }, pid);
}
await br.close(); await writeFile(path.join(HERE, 'splitlink-measure.json'), JSON.stringify(out, null, 1)); console.log(Object.keys(out).length, 'panels'); process.exit(0);
