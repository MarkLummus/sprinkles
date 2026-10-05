// Sid, 2026-10-04 (decision 45): measures the print page-break boards, one page at a time, at their natural size.
//   node breaks-measure.mjs probe <R35C_BreakProbe.dc.html>   -> breaks-measure.json { probe: { pid: {...} } }
//   node breaks-measure.mjs board <R35C_BreakBoard.dc.html>   -> breaks-measure.json { board: { pid: {...} } }   (the other key is kept)
// Per page (a .fp-win[data-pid] holding a .pp): article, thead, h2, every body row (data-r, y/h), the Total row, the three column widths of the first body row, every Instructions step (data-s), the Before you start
// section; y is from the page's top edge (the .pp's), in WebKit at 1x. The page's own margins are 48 top, 40 bottom (the board's, as decision 36's print board drew them).
import { readFile, writeFile } from 'node:fs/promises'; import { existsSync } from 'node:fs'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const [mode, file] = process.argv.slice(2);
const br = await webkit.launch(); const ctx = await br.newContext({ viewport: { width: 1500, height: 900 } }); const p = await ctx.newPage();
await p.goto('file://' + file); await p.waitForTimeout(900); await p.evaluate(() => document.fonts.ready);
const r = await p.evaluate(() => {
  const out = {};
  for (const w of document.querySelectorAll('[data-pid]')) {
    const pp = w.querySelector('.pp'); const t = pp.getBoundingClientRect(); const rc = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: +(b.x - t.x).toFixed(2), y: +(b.y - t.y).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; };
    const o = { page: rc(pp), article: rc(pp.querySelector('[data-m="article"]')), thead: rc(pp.querySelector('[data-m="thead"]')), h2: rc(pp.querySelector('[data-m="h2"]')), before: rc(pp.querySelector('.before-region')), table: rc(pp.querySelector('.ingredient-table')) };
    o.rows = [...pp.querySelectorAll('tr[data-r]')].map((e) => ({ r: e.dataset.r, ...rc(e) })).map((x) => x);
    const body = pp.querySelector('tbody tr:not(.ingredient-table__step-head)'); o.cols = body ? [...body.children].map((c) => +c.getBoundingClientRect().width.toFixed(2)) : [];
    o.steps = [...pp.querySelectorAll('li[data-s]')].map((e) => ({ n: e.dataset.s, ...rc(e) }));
    o.method = rc(pp.querySelector('.method-region'));
    out[w.dataset.pid] = o;
  }
  return out;
});
await br.close();
const f = path.join(HERE, 'breaks-measure.json'); const all = existsSync(f) ? JSON.parse(await readFile(f, 'utf8')) : {}; all[mode] = r;
await writeFile(f, JSON.stringify(all, null, 1)); console.log(mode, Object.keys(r).length, 'pages'); process.exit(0);
