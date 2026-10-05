// Sid, 2026-10-04 (decision 39): measures the Version-details rhythm probe board, one panel at a time, for the crops and the captions' numbers.
//   node rhythm-measure.mjs <path to R35C_RhythmProbe.dc.html>  -> rhythm-measure.json  { pid: { ver, dl, gaps: { box: [...], ink: [...] }, items: [...] } }   (WebKit, device scale 2)
// Box gap: the distance from one line's box to the next line's box (a line is a dt and its dd on the same row, or the Why label, or the Why value). Ink gap: the same, between the lowest ink of one line
// (a link's underline counts) and the highest ink of the next, read from a 2x screenshot of the details.
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const probe = process.argv[2];
const br = await webkit.launch(); const ctx = await br.newContext({ viewport: { width: 1700, height: 900 }, hasTouch: true, deviceScaleFactor: 2 }); const p = await ctx.newPage();
await p.goto('file://' + probe); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
const pids = await p.evaluate(() => [...document.querySelectorAll('[data-pid]')].map((w) => w.dataset.pid));
const out = {};
for (const pid of pids) {
  await p.evaluate((pid) => { for (const w of document.querySelectorAll('[data-pid]')) w.style.display = w.dataset.pid === pid ? 'block' : 'none'; }, pid);
  const dlh = p.locator(`[data-pid="${pid}"] [data-m="dl"]`);
  const buf = await dlh.screenshot();
  const r = await p.evaluate(async ({ pid, b64 }) => {
    const w = document.querySelector(`[data-pid="${pid}"]`); const sh = w.querySelector('.shell').getBoundingClientRect(); const rr = (el) => { const b = el.getBoundingClientRect(); return { x: +(b.x - sh.x).toFixed(1), y: +(b.y - sh.y).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
    const dl = w.querySelector('[data-m="dl"]'); const dlr = dl.getBoundingClientRect();
    const kids = [...dl.children].map((e) => ({ tag: e.tagName, text: e.textContent.trim().slice(0, 24), top: e.getBoundingClientRect().top - dlr.top, bottom: e.getBoundingClientRect().bottom - dlr.top }));
    // lines: a dt followed by a dd that shares its row (same top within 3px) are one line; the Why label and the Why value are each their own line
    const lines = []; for (let i = 0; i < kids.length; i++) { const k = kids[i]; const n = kids[i + 1];
      if (k.tag === 'DT' && n && n.tag === 'DD' && Math.abs(n.top - k.top) < 3.5) { lines.push({ top: Math.min(k.top, n.top), bottom: Math.max(k.bottom, n.bottom) }); i++; } else lines.push({ top: k.top, bottom: k.bottom }); }
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
    const rows = []; for (let y = 0; y < c.height; y++) { let ink = false; for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (d[i] < 200 || d[i + 1] < 200) { ink = true; break; } } rows.push(ink); }
    const bands = []; let s = null; rows.forEach((v, y) => { if (v && s === null) s = y; if (!v && s !== null) { bands.push([s / 2, y / 2]); s = null; } }); if (s !== null) bands.push([s / 2, rows.length / 2]);
    const merged = []; for (const b of bands) { const l = merged[merged.length - 1]; if (l && b[0] - l[1] < 3) l[1] = b[1]; else merged.push([...b]); }
    // each line's first and last ink: the bands whose centre falls inside the line's box (a little slack), else the nearest band
    const inks = lines.map((ln) => { const mine = merged.filter((b) => (b[0] + b[1]) / 2 >= ln.top - 3 && (b[0] + b[1]) / 2 <= ln.bottom + 3); return mine.length ? [mine[0][0], mine[mine.length - 1][1]] : null; });
    const box = [], ink = []; for (let i = 0; i + 1 < lines.length; i++) { box.push(+(lines[i + 1].top - lines[i].bottom).toFixed(1)); ink.push(inks[i] && inks[i + 1] ? +(inks[i + 1][0] - inks[i][1]).toFixed(1) : null); }
    return { ver: rr(w.querySelector('[data-m="ver"]')), dl: rr(dl), gaps: { box, ink }, lines: lines.length };
  }, { pid, b64: buf.toString('base64') });
  out[pid] = r;
}
await br.close(); await writeFile(path.join(HERE, 'rhythm-measure.json'), JSON.stringify(out, null, 1)); console.log(Object.keys(out).length, 'panels'); process.exit(0);
