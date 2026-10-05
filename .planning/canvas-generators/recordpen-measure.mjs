// Sid, 2026-10-04 (decision 40): measures the record-pen probe board, one panel at a time, for the crops and the captions' numbers.
//   node recordpen-measure.mjs <path to R35C_RecordPenProbe.dc.html>  -> recordpen-measure.json
// log: the .notebook-log box (y relative to the panel's top); over: how far any descendant's right edge passes the panel's right edge (0 = none);
// cues (cue panels): cue_item = the first group cue's bottom to the top of its first axis name (what the eye sees); group_cue = the last axis mark's bottom to the next cue's top (the rule and the gap between them included);
// head_cue = the "Any problems?" head's bottom to the next cue's top; cue_chips = that cue's bottom to its first chip's top; region = the first cue's top to the last chip group's bottom; crop = the same as y and h.
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const probe = process.argv[2];
const br = await webkit.launch(); const ctx = await br.newContext({ viewport: { width: 1700, height: 900 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto('file://' + probe); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
const pids = await p.evaluate(() => [...document.querySelectorAll('[data-pid]')].map((w) => w.dataset.pid));
const out = {};
for (const pid of pids) {
  out[pid] = await p.evaluate((pid) => {
    for (const w of document.querySelectorAll('[data-pid]')) w.style.display = w.dataset.pid === pid ? 'block' : 'none';
    const w = document.querySelector(`[data-pid="${pid}"]`); const wr = w.getBoundingClientRect(); const R = (e) => { const b = e.getBoundingClientRect(); return { x: +(b.x - wr.x).toFixed(1), y: +(b.y - wr.y).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
    const log = w.querySelector('[data-m="log"]'); let maxR = -1e9; for (const e of log.querySelectorAll('*')) { const b = e.getBoundingClientRect(); if (b.width && b.height) maxR = Math.max(maxR, b.right); }
    const o = { log: R(log), over: +Math.max(0, maxR - wr.right).toFixed(1) };
    if (w.dataset.what === 'cues') {
      const grid = w.querySelector('[data-m="grid"]'); const cues = [...log.querySelectorAll('.axes-cue')];
      const top = (e) => e.getBoundingClientRect().top, bot = (e) => e.getBoundingClientRect().bottom;
      const g1 = grid.children[0], g2 = grid.children[1], head = grid.children[2], dc = grid.children[3], dd = grid.children[4];
      const cue1 = cues[0]; const item1 = g1.querySelector('.axis-mark__name');
      const items1 = g1.querySelectorAll('.axis-mark'); const lastOf1 = items1[items1.length - 1]; const cue2 = cues[1];
      const cueD = dc.querySelector('.axes-cue'); const chip = dc.querySelector('.chip-toggle');
      o.cues = { cue_item: +(top(item1) - bot(cue1)).toFixed(1), group_cue: +(top(cue2) - bot(lastOf1)).toFixed(1), head_cue: +(top(cueD) - bot(head)).toFixed(1), cue_chips: +(top(chip) - bot(cueD)).toFixed(1), region: +(bot(dd) - top(cue1)).toFixed(1) };
      o.crop = { y: +(top(cue1) - wr.y).toFixed(1), h: o.cues.region };
    }
    return o;
  }, pid);
}
await br.close(); await writeFile(path.join(HERE, 'recordpen-measure.json'), JSON.stringify(out, null, 1)); console.log(Object.keys(out).length, 'panels'); process.exit(0);
