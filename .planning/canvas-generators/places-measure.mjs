// Sid, 2026-10-17: measures the new markup and rules on the LIVE build's real DOM (the preview on 127.0.0.1:4173), WebKit, coarse pointer, at 1366 and 393 (and a few widths between).
//   node places-measure.mjs   reads places-snippets.json (python3 places.py writes it), writes places-measure.json; run places.py again so the boards take the measured heights.
// Each variant: the snippet replaces .shell__main's content on /notebook or /ingredients, the new rules are added in a style tag, then rects of the data-m elements are read.
import { readFileSync, writeFileSync } from 'node:fs'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const SN = JSON.parse(readFileSync(HERE + '/places-snippets.json', 'utf8')); const BASE = 'http://127.0.0.1:4173';
const WIDTHS = (process.env.WIDTHS || '1366,393').split(',').map(Number);
const run = async (b, W, route, key, extraCoarse = true) => {
  const ctx = await b.newContext({ viewport: { width: W, height: W === 393 ? 852 : 1024 }, hasTouch: extraCoarse }); const p = await ctx.newPage();
  await p.goto(BASE + route, { waitUntil: 'networkidle' }); await p.waitForSelector('.place__title'); await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(({ css, coarse, html }) => {
    const st = document.createElement('style'); st.textContent = css + (matchMedia('(pointer: coarse)').matches ? coarse : ''); document.head.appendChild(st);
    document.querySelector('.shell__main').innerHTML = html; window.scrollTo(0, 0);
    const R = (e) => { const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +(r.y + scrollY).toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
    const q = (s) => [...document.querySelectorAll(s)].map(R);
    const rows = [...document.querySelectorAll('[data-m="row"]')].map(R);
    const open = document.querySelector('.ing__detail'); const li = open && open.closest('li');
    const pg = document.querySelector('[data-m="page"]') || document.querySelector('.list-page'); const mainR = document.querySelector('.shell__main').getBoundingClientRect(); const pgR = pg.getBoundingClientRect(); const contentH = Math.round(pgR.bottom + scrollY + (parseFloat(getComputedStyle(document.querySelector('.shell__main')).paddingBottom) || 0));
    return { docH: Math.max(contentH, innerWidth === 393 ? 0 : 0) && contentH, fullDocH: document.documentElement.scrollHeight, scrollW: document.documentElement.scrollWidth, innerW: innerWidth, coarse: matchMedia('(pointer: coarse)').matches,
      rows: rows.length, rowH: rows.length ? [Math.min(...rows.map((x) => x.h)), Math.max(...rows.map((x) => x.h))] : null, firstRow: rows[0] || null, li: li ? R(li) : null,
      link: q('[data-m="link"]').slice(0, 2), head: q('[data-m="head"]').slice(0, 2), meta: q('[data-m="meta"]').slice(0, 2), name: q('[data-m="name"]').slice(0, 2), clear: q('[data-m="clear"]'), control: q('[data-m="control"]').slice(0, 2),
      namefield: q('input[data-m="name"]'), category: q('select[data-m="category"]'), chips: q('.ing__chip').slice(0, 2), chipsBox: q('[data-m="chips"]'), filters: q('[data-m="filters"]'), status: q('[data-m="status"]'), count: q('[data-m="count"]'),
      none: q('[data-m="none"]'), empty: q('[data-m="empty"]'), page: q('[data-m="page"]'), figures: q('[data-m="figures"]'), detail: q('[data-m="detail"]'),
      overflow: [...document.querySelectorAll('.shell__main *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 0.5).length };
  }, { css: SN.css, coarse: SN.coarse, html: SN[key] });
  await ctx.close(); return r;
};
const b = await webkit.launch(); const out = {};
for (const W of WIDTHS) {
  const tag = 'p' + W;
  out.nb = out.nb || {}; out.ing = out.ing || {}; out.many = out.many || {}; out.opt = out.opt || {};
  out.nb[tag] = await run(b, W, '/notebook', 'nb_several'); out.nb['one' + W] = await run(b, W, '/notebook', 'nb_one'); out.nb['zero' + W] = await run(b, W, '/notebook', 'nb_zero');
  out.ing[tag] = await run(b, W, '/ingredients', 'ing_26'); out.ing['milk' + W] = await run(b, W, '/ingredients', 'ing_milk'); out.ing['sugar' + W] = await run(b, W, '/ingredients', 'ing_sugar'); out.ing['none' + W] = await run(b, W, '/ingredients', 'ing_none');
  out.ing['cocoa' + W] = await run(b, W, '/ingredients', 'crop_cocoa'); out.ing['lbg' + W] = await run(b, W, '/ingredients', 'crop_lbg'); out.ing['heavy' + W] = await run(b, W, '/ingredients', 'crop_heavy');
  out.many[tag] = await run(b, W, '/ingredients', 'many'); out.many['fruit' + W] = await run(b, W, '/ingredients', 'many_fruit');
  out.opt['select' + W] = await run(b, W, '/ingredients', 'opt_select'); out.opt['chips' + W] = await run(b, W, '/ingredients', 'opt_chips');
}
// the generator's keys (heights of the windows)
const g = (o, k) => o[k];
const M = { nb: {}, ing: {}, many: {}, opt: {}, raw: out };
for (const W of [1366, 393]) {
  if (!out.nb['p' + W]) continue;
  M.nb['p' + W] = { docH: out.nb['p' + W].docH }; M.nb['one' + W] = { docH: out.nb['one' + W].docH }; M.nb['zero' + W] = { docH: out.nb['zero' + W].docH };
  M.ing['p' + W] = { docH: out.ing['p' + W].docH, openY: out.ing['p' + W].li ? out.ing['p' + W].li.y : 0 };
  for (const k of ['cocoa', 'lbg']) { const r = out.ing[k + W]; M.ing['crop' + k + W] = { y0: Math.round(r.li.y - 12), h: Math.round(r.li.h + 24) }; }
  M.ing['f' + W] = { h: out.ing['milk' + W].docH }; M.ing['none' + W] = { h: out.ing['none' + W].docH };
  M.many['p' + W] = { docH: out.many['p' + W].docH }; M.many['win' + W] = { h: Math.min(out.many['p' + W].docH, 1500) };
  M.opt['h' + W] = { h: out.opt['select' + W].docH }; M.opt['c' + W] = { h: out.opt['chips' + W].docH };
}
// the keys places.py reads
M.ing.crop1366 = { y0: M.ing.croppcocoa1366?.y0, h: M.ing.cropcocoa1366?.h }; M.ing.crop393 = { y0: M.ing.cropcocoa393?.y0, h: M.ing.cropcocoa393?.h }; M.ing.crop393b = { y0: M.ing.croplbg393?.y0, h: M.ing.croplbg393?.h };
M.ing.f1366 = { h: M.ing.f1366?.h }; M.ing.f393 = { h: M.ing.f393?.h }; M.ing.none1366 = { h: M.ing.none1366?.h };
M.opt.h1366 = { h: M.opt.h1366?.h }; M.opt.h393 = { h: M.opt.h393?.h }; M.opt.chipsExtra = out.opt.chips393 && out.opt.select393 ? out.opt.chips393.docH - out.opt.select393.docH : 160;
M.many.win1366 = { h: M.many.win1366?.h }; M.many.p1366 = { docH: out.many.p1366?.docH }; M.many.p393 = { docH: out.many.p393?.docH };
writeFileSync(HERE + '/places-measure.json', JSON.stringify(M, null, 1)); await b.close();
for (const [k, v] of Object.entries(out)) for (const [kk, r] of Object.entries(v)) console.log(k, kk, 'docH', r.docH, 'scrollW', r.scrollW, 'overflow', r.overflow, 'rows', r.rows, 'rowH', JSON.stringify(r.rowH), 'coarse', r.coarse);
process.exit(0);
