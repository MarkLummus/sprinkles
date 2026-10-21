// Sid, 2026-10-21: measures the log column's text roles and the Scales region's gaps for p-rhythm.py, in WebKit with a coarse pointer (real DOM, never CSS reasoning).
//   node p-rhythm-measure.mjs <measure.html>  -> p-rhythm-measure.json  {pid: {height, roles: [{role, top, right, height, fontFamily, ...}], gaps: [{from, to, a, b}]}}
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(process.argv[2]);
const ROLES = [
  ['Region name', '.mk-region .batch-row__head .region-name'], ['Clear (head act)', '.batch-row__head-acts .text-control'], ['Menu value', '.mk-menu'],
  ['Field caption', '.notebook-field .notebook-caption'], ['Field value', '.notebook-field .ink-field'], ['Unit', '.mk-unit'],
  ['Targets caption', '.mk-region[aria-label="Style"] > .mk-body > .notebook-caption'], ['Band label', '.mk-band__label'], ['Band term', '.mk-band__label small'], ['Band field', '.mk-band .ink-field'],
  ['Group cue', '.mk-cue'], ['Core names', '.mk-core'], ['Card head', '.mk-card__head .notebook-caption'], ['remove', '.mk-card__head .text-control'],
  ['Kind caption', '.segmented-field__caption'], ['Kind cell', '.segmented__option'], ['Stops line', '.mk-stops'], ['Required', '.field-requirement'], ['Add link', '.mk-add'],
];
const BLOCKS = '.batch-row__head, .mk-cue, .mk-core, .mk-card__head, .mk-card > .notebook-field, .mk-pair, .segmented-field, .mk-stops, .mk-add-row';
const b = await webkit.launch();
const ctx = await b.newContext({ viewport: { width: 1500, height: 1000 }, hasTouch: true });
const p = await ctx.newPage();
await p.goto('file://' + file); await p.waitForTimeout(500); await p.evaluate(() => document.fonts.ready);
const out = await p.evaluate(({ ROLES, BLOCKS, LOGX }) => {
  const res = {};
  for (const w of document.querySelectorAll('[data-pid]')) {
    const r0 = w.getBoundingClientRect(); const log = w.querySelector('.notebook-log'); const lr = log.getBoundingClientRect();
    const roles = [];
    for (const [role, sel] of ROLES) {
      const e = w.querySelector(sel); if (!e) continue;
      const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
      roles.push({ role, top: r.top - r0.top, right: r.right - r0.left - LOGX, height: r.height, fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, textTransform: s.textTransform, letterSpacing: s.letterSpacing, lineHeight: s.lineHeight, color: s.color });
    }
    const sc = w.querySelector('.mk-region[aria-label="Scales"]');
    const blocks = [...sc.querySelectorAll(BLOCKS)].map((e) => ({ e, r: e.getBoundingClientRect() })).sort((a, c) => a.r.top - c.r.top);
    const gaps = [];
    for (let i = 0; i + 1 < blocks.length; i++) {
      const a = blocks[i], c = blocks[i + 1]; if (c.r.top - a.r.bottom < 0.5) continue;
      gaps.push({ from: a.r.bottom - r0.top, to: c.r.top - r0.top, a: a.e.className, b: c.e.className });
    }
    res[w.dataset.pid] = { height: Math.ceil(w.querySelector('.inner').getBoundingClientRect().height), logH: Math.ceil(lr.height), roles, gaps };
  }
  return res;
}, { ROLES, BLOCKS, LOGX: 976 });
await writeFile(path.join(HERE, 'p-rhythm-measure.json'), JSON.stringify(out, null, 1));
console.log(Object.entries(out).map(([k, v]) => `${k}: ${v.height} ${v.roles.length} roles ${v.gaps.length} gaps`).join('; ')); await b.close(); process.exit(0);
