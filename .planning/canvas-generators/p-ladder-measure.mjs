// Sid, 2026-10-21: measures each ladder panel (p-ladder.py) in WebKit with a coarse pointer: the crop (start and end selectors), every role's face and box, and the
// gaps between consecutive blocks inside the crop.   node p-ladder-measure.mjs <measure.html> -> p-ladder-measure.json
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(process.argv[2]);
const ROLES = [['Region name', '.region-name'], ['Group cue', '.axes-cue, .mk-cue, .batch-row__group-label--cue'], ['Any problems?', '.defects-head > .pen-caption, h4.batch-row__group-label:not(.batch-row__group-label--cue)'],
  ['Core names', '.mk-core'], ['Card head', '.mk-card__head .notebook-caption'], ['Caption', '.notebook-caption, .segmented-field__caption:not(.axes-cue), .batch-margin__field > .pen-caption, .field-row__label > .pen-caption, .batch-row__cell-label'],
  ['Axis name', '.axis-mark__name'], ['Chip', '.chip-toggle'], ['Cell value', '.batch-row__cell-value'], ['Next time', 'h3.batch-row__group-label'], ['Stops line', '.mk-stops'], ['remove', '.mk-card .text-control'], ['Add link', '.mk-add'], ['Hand', '.app-hand']];
const BLOCKS = '.batch-row__head, .mk-cue, .mk-core, .mk-card__head, .mk-caprow, .mk-card > .notebook-field, .mk-pair, .mk-stops, .mk-add-row, .axis-mark, .segmented-field__head, .segmented:not(.segmented-field), .defects-head, .defects-row__chips, .batch-row__group-label, .batch-row__cell, .batch-row__conclusion > *, .batch-margin__field, .field-row, .tasting-reading__problems';
const b = await webkit.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 1000 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto('file://' + file); await p.waitForTimeout(500); await p.evaluate(() => document.fonts.ready);
const out = await p.evaluate(({ ROLES, BLOCKS, LOGX }) => {
  const res = {};
  for (const w of document.querySelectorAll('[data-pid]')) {
    const r0 = w.getBoundingClientRect(); const log = w.querySelector('.notebook-log');
    const st = w.dataset.start.split('@'); const s0 = st[1] === 'last' ? [...log.querySelectorAll(st[0])].pop() : log.querySelector(st[0]); const ends = log.querySelectorAll(w.dataset.end); const s1 = ends[ends.length - 1];
    const start = s0.getBoundingClientRect().top - r0.top - 8, end = s1.getBoundingClientRect().bottom - r0.top + 8;
    const inCrop = (r) => r.top - r0.top >= start - 1 && r.bottom - r0.top <= end + 1;
    const roles = [];
    for (const [role, sel] of ROLES) {
      const e = [...log.querySelectorAll(sel)].find((el) => inCrop(el.getBoundingClientRect()) && el.getBoundingClientRect().height > 0); if (!e) continue;
      const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
      roles.push({ role, text: e.textContent.trim().slice(0, 24), top: r.top - r0.top, right: r.right - r0.left - LOGX, height: r.height, fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, textTransform: s.textTransform, letterSpacing: s.letterSpacing, lineHeight: s.lineHeight, color: s.color });
    }
    const blocks = [...log.querySelectorAll(BLOCKS)].map((e) => ({ e, r: e.getBoundingClientRect() })).filter((x) => x.r.height > 0 && inCrop(x.r)).sort((a, c) => a.r.top - c.r.top || a.r.left - c.r.left);
    const rows = []; for (const x of blocks) { if (rows.length && Math.abs(rows[rows.length - 1].r.top - x.r.top) < 1) continue; rows.push(x); }
    const gaps = [];
    for (let i = 0; i + 1 < rows.length; i++) { const a = rows[i], c = rows[i + 1]; if (c.r.top < a.r.bottom - 0.5) continue; const nm = (x) => x.e.className.toString().split(' ')[0] + ':' + x.e.textContent.trim().slice(0, 12); gaps.push({ from: a.r.bottom - r0.top, to: c.r.top - r0.top, a: nm(a), b: nm(c) }); }
    res[w.dataset.pid] = { start, end, roles, gaps };
  }
  return res;
}, { ROLES, BLOCKS, LOGX: 976 });
await writeFile(path.join(HERE, 'p-ladder-measure.json'), JSON.stringify(out, null, 1));
console.log(Object.entries(out).map(([k, v]) => `${k}: ${Math.round(v.end - v.start)} tall, ${v.roles.length} roles, ${v.gaps.length} gaps`).join('\n')); await b.close(); process.exit(0);
