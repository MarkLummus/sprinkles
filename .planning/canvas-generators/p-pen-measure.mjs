// Sid, 2026-10-22 (2026-10-23: the control-size panels, data-size, add every segmented control's options and the first axis's stops): measures each P10_PenRhythm panel (p-pen.py; copied from p-pen-rhythm-measure.mjs 2026-10-25 so the rhythm board's measures stay) in WebKit with a coarse pointer: the crop, every role's face and box, and the
// visual intervals down the column: a label's line box (its line-height at the foot of its element, so a reserved caption box does not count as text) to
// the next label's line box or the next control's box, as the proposal's tables measure.   node p-pen-rhythm-measure.mjs <measure.html> -> p-pen-measure.json
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(process.argv[2]);
const ROLES = [['Region name', '.region-name'], ['Group cue', '.axes-cue'], ['Caption', '.field-row__label > .pen-caption, .batch-margin__field > .pen-caption, .segmented-field__caption:not(.axes-cue), .note-block__eyebrow'],
  ['Control caption', '.mo-group .segmented-field__caption:not(.axes-cue)'], ['Axis name', '.axis-mark__name'], ['Any problems?', '.defects-head > .pen-caption'], ['Field', '.ink-field'], ['Prose field', '.prose-field'],
  ['Option', '.segmented__option'], ['Anchor', '.axis-mark__anchors span'], ['Chip', '.chip-toggle'], ['Clear', '.segmented-field__clear, .axis-mark__clear'], ['Button', '.save-ceremony button:last-of-type']];
// the column's items, document order: text roles are measured by their text's line box; controls by their box
const ITEMS = '.region-name, .pen-caption, .ink-field, .field-requirement, .prose-field, .segmented, .axis-mark__name, .axis-mark__stops, .axis-mark__anchors, .defects-row__chips, .save-ceremony button';
const TEXT = new Set(['h2', 'h3', 'p', 'span']);
const b = await webkit.launch(); const ctx = await b.newContext({ viewport: { width: 1500, height: 1000 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto('file://' + file); await p.waitForTimeout(500); await p.evaluate(() => document.fonts.ready);
const out = await p.evaluate(({ ROLES, ITEMS, TEXT, LOGX }) => {
  const res = {}; TEXT = new Set(TEXT);
  const textRect = (e) => { const b = e.getBoundingClientRect(); const lh = parseFloat(getComputedStyle(e).lineHeight); const h = Number.isFinite(lh) ? Math.min(lh, b.height) : b.height; return { top: b.bottom - h, bottom: b.bottom }; };
  for (const w of document.querySelectorAll('[data-pid]')) {
    const r0 = w.getBoundingClientRect(); const log = w.querySelector('.notebook-log'); const pen = log.querySelector('.batch-margin--pen') || log; const lx = pen.getBoundingClientRect().left;      // the pen's left: at 393 the log is the full 393 and the pen sits 20 in
    const s0 = log.querySelector(w.dataset.start); const ends = log.querySelectorAll(w.dataset.end); const s1 = ends[w.dataset.endn !== undefined ? +w.dataset.endn : ends.length - 1];
    const start = s0.getBoundingClientRect().top - r0.top - 8, end = s1.getBoundingClientRect().bottom - r0.top + 8;
    const inCrop = (r) => r.top - r0.top >= start - 1 && r.bottom - r0.top <= end + 1;
    const roles = [];
    for (const [role, sel] of ROLES) {
      const e = [...log.querySelectorAll(sel)].find((el) => inCrop(el.getBoundingClientRect()) && el.getBoundingClientRect().height > 0); if (!e) continue;
      const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
      roles.push({ role, text: e.textContent.trim().slice(0, 24), top: r.top - r0.top, right: r.right - r0.left - LOGX, height: r.height, fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, textTransform: s.textTransform, letterSpacing: s.letterSpacing, lineHeight: s.lineHeight, color: s.color });
    }
    const items = [];
    for (const e of log.querySelectorAll(ITEMS)) {
      const box = e.getBoundingClientRect(); if (box.height === 0 || !inCrop(box) || (box.left - lx > 3 && !e.closest('.save-ceremony'))) continue;      // the save buttons sit at the right
      const tag = e.tagName.toLowerCase(); const r = TEXT.has(tag) ? textRect(e) : box;
      items.push({ top: r.top - r0.top, bottom: r.bottom - r0.top, name: (TEXT.has(tag) ? e.textContent.trim() : (e.value || e.textContent.trim() || e.className.toString().split(' ')[0])).slice(0, 20), cls: e.className.toString().split(' ')[0] });
    }
    items.sort((a, c) => a.top - c.top);
    const gaps = [];
    for (let i = 0; i + 1 < items.length; i++) { const a = items[i], c = items[i + 1]; if (c.top < a.bottom - 0.5) continue; gaps.push({ from: a.bottom, to: c.top, a: a.cls + ':' + a.name, b: c.cls + ':' + c.name }); }
    const rec = { start, end, logLeft: lx - r0.left, logWidth: pen.getBoundingClientRect().width, winW: w.getBoundingClientRect().width, roles, gaps };
    if (w.dataset.size) {
      const nameOf = (seg) => { const f = seg.closest('.segmented-field'); const h = f && f.querySelector('.segmented-field__head'); return (h ? h.querySelector('.pen-caption, .axes-cue, span') : null)?.textContent.trim().slice(0, 24) || seg.closest('.field-row__label')?.querySelector('.pen-caption')?.textContent.trim().slice(0, 24) || '?'; };
      rec.segs = [];
      for (const seg of log.querySelectorAll('.segmented')) {
        const r = seg.getBoundingClientRect(); if (!inCrop(r)) continue;
        const opts = [...seg.querySelectorAll('.segmented__option')]; const bs = opts.map((o) => o.getBoundingClientRect());
        const sum = bs.reduce((a, b) => a + b.width, 0) - (opts.length - 1);      // the shared hairlines overlap by 1
        rec.segs.push({ name: nameOf(seg), top: r.top - r0.top, bottom: Math.max(...bs.map((b) => b.bottom)) - r0.top, left: Math.min(...bs.map((b) => b.left)) - r0.left, right: Math.max(...bs.map((b) => b.right)) - r0.left,
          sum, column: r.width, rows: new Set(bs.map((b) => Math.round(b.top))).size, size: getComputedStyle(opts[0]).fontSize, padX: getComputedStyle(opts[0]).paddingLeft, optH: bs[0].height, options: bs.map((b, i) => ({ text: opts[i].textContent.trim(), w: b.width })) });
      }
      rec.stops = [];
      for (const ax of log.querySelectorAll('.axis-mark')) {
        const st = [...ax.querySelectorAll('.axis-mark__stop')]; if (!st.length) continue; const bs = st.map((o) => o.getBoundingClientRect()); if (!inCrop(bs[0])) continue;
        rec.stops.push({ name: ax.querySelector('.axis-mark__name')?.textContent.trim().slice(0, 24) || 'axis', n: st.length, w: bs[0].width, h: bs[0].height, size: getComputedStyle(st[0]).fontSize, top: bs[0].top - r0.top, bottom: Math.max(...bs.map((b) => b.bottom)) - r0.top, left: Math.min(...bs.map((b) => b.left)) - r0.left, right: Math.max(...bs.map((b) => b.right)) - r0.left });
      }
    }
    res[w.dataset.pid] = rec;
  }
  return res;
}, { ROLES, ITEMS, TEXT: [...TEXT], LOGX: 976 });
await writeFile(path.join(HERE, 'p-pen-measure.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) {
  console.log(`${k}: ${Math.round(v.end - v.start)} tall, log left ${v.logLeft} wide ${v.logWidth}, ${v.roles.length} roles, ${v.gaps.length} gaps`);
  if (!v.segs) for (const g of v.gaps) console.log(`  ${(g.to - g.from).toFixed(1).padStart(6)}  ${g.a}  ->  ${g.b}`);
  for (const s of v.segs || []) console.log(`  ${s.name.padEnd(22)} ${s.rows} row(s)  sum ${s.sum.toFixed(1)} / col ${s.column.toFixed(1)}  ${s.size} pad ${s.padX}`);
  for (const s of v.stops || []) console.log(`  ${s.name.padEnd(22)} ${s.n} stops ${s.w}x${s.h} ${s.size}`);
}
await b.close(); process.exit(0);
