// Sid, 2026-10-17: board against build. Renders a board file locally (WebKit, coarse) and compares each panel's data-m rects with the live build's injected markup (places-measure.json raw).
//   node places-parity.mjs <board file> <panel index> <raw key> <raw variant>   e.g. P9_Notebook.dc.html 0 nb p1366
import { readFileSync } from 'node:fs'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const M = JSON.parse(readFileSync(HERE + '/places-measure.json', 'utf8')).raw;
const [,, file, idx, k, v] = process.argv; const b = await webkit.launch(); const ctx = await b.newContext({ viewport: { width: 2400, height: 1200 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto('file://' + file); await p.waitForTimeout(400);
const got = await p.evaluate((i) => { const win = document.querySelectorAll('.p4-win')[i]; const o = win.getBoundingClientRect(); const R = (e) => { const r = e.getBoundingClientRect(); return { x: +(r.x - o.x).toFixed(1), y: +(r.y - o.y).toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
  const q = (s) => [...win.querySelectorAll(s)].map(R); return { row: q('[data-m="row"]')[0], link: q('[data-m="link"]')[0], meta: q('[data-m="meta"]')[0], head: q('[data-m="head"]')[0], name: q('[data-m="name"]')[0], control: q('[data-m="control"]')[0], category: q('select[data-m="category"]')[0], namefield: q('input[data-m="name"]')[0], count: q('[data-m="count"]')[0], page: q('[data-m="page"]')[0] }; }, +idx);
const live = M[k][v]; const pick = { row: live.firstRow, link: live.link[0], meta: live.meta[0], head: live.head[0], name: live.name[0], control: live.control[0], category: live.category[0], namefield: live.namefield[0], count: live.count[0], page: live.page[0] };
for (const key of Object.keys(got)) { const g = got[key], l = pick[key]; if (!g || !l) continue; console.log(key.padEnd(9), 'board', JSON.stringify([g.w, g.h]), 'build', JSON.stringify([l.w, l.h]), 'dx', (g.x - l.x).toFixed(1), g.w === l.w && g.h === l.h ? 'same size' : 'DIFF'); }
await b.close();
