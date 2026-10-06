// Sid, 2026-10-06 (decision 36, placement B): measures the probe board (every panel at natural size) for the crops of the "Before you start" boards, and the heights the captions quote.
//   node bysb-measure.mjs <path to R35C_BysBProbe.dc.html>  -> bysb-measure.json  { pid: { marker: {x,y,w,h}, ... , '_page': h } }
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const probe = process.argv[2]; const printBoard = process.argv[3];
const br = await webkit.launch(); const ctx = await br.newContext({ viewport: { width: 1500, height: 900 }, hasTouch: true }); const p = await ctx.newPage();
await p.goto('file://' + probe); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
const r = await p.evaluate(() => { const out = {}; for (const w of document.querySelectorAll('[data-pid]')) { const sh = w.querySelector('.shell').getBoundingClientRect(); const o = {};
  for (const el of w.querySelectorAll('[data-m]')) { const b = el.getBoundingClientRect(); o[el.dataset.m] = { x: Math.round(b.x - sh.x), y: Math.round(b.y - sh.y), w: Math.round(b.width), h: Math.round(b.height) }; }
  const bs = w.querySelector('section.before-region');
  if (bs) { const r = bs.getBoundingClientRect(), cs = getComputedStyle(bs), h2 = bs.querySelector('h2'), hc = getComputedStyle(h2), ul = bs.querySelector('ul'), ing = w.querySelector('section.ingredient-table-region'), ih2 = ing.querySelector('h2'), ic = getComputedStyle(ih2);
    const q = (el) => el ? Math.round((el.getBoundingClientRect().y - r.y) * 100) / 100 : null;
    const face = (c) => ({ family: c.fontFamily.split(',')[0], size: c.fontSize, weight: c.fontWeight, lineHeight: c.lineHeight, transform: c.textTransform, spacing: c.letterSpacing, color: c.color, mt: c.marginTop, mb: c.marginBottom });
    o._sec = { w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100, border: [cs.borderTopWidth, cs.borderBottomWidth], padB: cs.paddingBottom, h2: face(hc), ingH2: face(ic), h2H: Math.round(h2.getBoundingClientRect().height * 100) / 100,
      ulTop: ul ? q(ul) : null, ulH: ul ? Math.round(ul.getBoundingClientRect().height * 100) / 100 : null, lis: [...bs.querySelectorAll('li')].map((li) => Math.round(li.getBoundingClientRect().height * 100) / 100),
      toIngr: Math.round((ing.getBoundingClientRect().y - r.bottom) * 100) / 100, ingTop: Math.round((ing.getBoundingClientRect().y - w.querySelector('.shell').getBoundingClientRect().y) * 100) / 100 }; }
  o._doc = Math.round(w.querySelector('.shell').getBoundingClientRect().height); out[w.dataset.pid] = o; } return out; });
if (printBoard) { await p.goto('file://' + printBoard); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
  r.print = await p.evaluate(() => { const o = {}; for (const w of document.querySelectorAll('.fp-win')) { const cls = [...w.classList].find((c) => c.startsWith('fp-pr-')); if (!cls) continue; const a = w.querySelector('article.recipe-page').getBoundingClientRect(); const pp = w.querySelector('.pp').getBoundingClientRect(); o[cls.replace('fp-', '')] = { content: Math.round(a.height), usable: Math.round(pp.height - 88), over: Math.round(a.bottom - (pp.bottom - 40)) }; } return o; }); }
await br.close(); await writeFile(path.join(HERE, 'bysb-measure.json'), JSON.stringify(r, null, 1)); console.log(Object.keys(r).length, 'panels'); process.exit(0);
