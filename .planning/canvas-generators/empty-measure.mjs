// Sid, 2026-10-05 (decision 49): measures the Sheet's grid in the build: the rows, the table's foot against its row's foot (the empty space), the side column. Mexican Chocolate v3 with its batch, Show changes off, and Olive Oil v1.
//   node empty-measure.mjs [chromium] [onehead]  -> empty-measure[-chromium][-onehead].json   (the build on 127.0.0.1:4173; 'onehead' adds decision 48's rule first)
import { writeFile, readFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const eng = process.argv.includes('chromium') ? chromium : webkit; const ONE = process.argv.includes('onehead');
const R = { mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01', olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89', mex3none: '/notebook/mexican-chocolate/mexican-chocolate-v3' };
const css = ONE ? '@media screen and (min-width:724px){' + (await readFile(path.join(HERE, 'ingredient-options.css'), 'utf8')).match(/\/\* === ONEHEAD ===[^*]*\*\/([\s\S]*?)(?=\/\* === |$)/)[1] + '}' : '';
const br = await eng.launch(eng === chromium ? { channel: 'chrome' } : {}); const out = {};
for (const k of ['mex3', 'olive1']) for (const W of [984, 1024, 1194, 1365, 1366, 1600, 1920]) {
  const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: eng === webkit, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4173' + R[k], { waitUntil: 'networkidle' }); await p.waitForSelector('.ingredient-table'); await p.evaluate(() => document.fonts.ready);
  if (css) await p.addStyleTag({ content: css }); await p.waitForTimeout(100);
  out[`${k}_${W}`] = await p.evaluate(() => { const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(2), y: +(b.y + scrollY).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2), bottom: +(b.bottom + scrollY).toFixed(2) }; };
    const pg = document.querySelector('.recipe-page'); const cs = getComputedStyle(pg); const reg = pg.querySelector('.ingredient-table-region'); const t = reg.querySelector('.ingredient-table'); const m = pg.querySelector('.method-region'); const side = pg.querySelector('.side-region');
    const lastKid = (el) => { const kids = [...el.children]; const k = kids[kids.length - 1]; return k ? r(k).bottom : null; };
    const jump = document.querySelector('.notebook-jump'); const log = document.querySelector('.notebook-log'); const body = document.querySelector('.notebook-body');
    return { cols: cs.gridTemplateColumns, rows: cs.gridTemplateRows, rowGap: cs.rowGap, page: r(pg), band: r(pg.querySelector('.recipe-band')), region: r(reg), table: r(t), emptyUnderTable: +(r(reg).bottom - r(t).bottom).toFixed(2), method: r(m), methodContentBottom: m ? lastKid(m) : null, emptyUnderMethod: m ? +(r(m).bottom - lastKid(m)).toFixed(2) : null, side: r(side), sideKids: [...side.children].map((c) => ({ cls: c.className, ...r(c) })), body: r(body), log: r(log), jump: jump && getComputedStyle(jump).display, doc: document.documentElement.scrollHeight, sheetW: r(pg).w, balanceOpen: !!document.querySelector('#fold-balance:not([hidden])') }; });
  await ctx.close();
}
await br.close(); const fn = 'empty-measure' + (eng === chromium ? '-chromium' : '') + (ONE ? '-onehead' : '') + '.json'; await writeFile(path.join(HERE, fn), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, 'rows', v.rows, '| region h', v.region.h, 'table h', v.table.h, 'EMPTY under table', v.emptyUnderTable, '| method h', v.method && v.method.h, 'empty under method', v.emptyUnderMethod, '| side h', v.side.h, 'page h', v.page.h, 'doc', v.doc, 'cols', v.cols, 'bal', v.balanceOpen);
