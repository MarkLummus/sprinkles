// Sid, 2026-10-05 (decision 49): tries the options for the empty space under the ingredient table on the built page and reads the Sheet's grid.
//   node empty-probe.mjs [chromium]  -> empty-probe[-chromium].json
// 'built': as it is. 'A': the surplus of the tall side column goes to the Instructions row (rows auto auto 1fr auto). 'AB': A, and Watch for closed (a tap on its Hide).
import { writeFile } from 'node:fs/promises'; import { fileURLToPath } from 'node:url'; import path from 'node:path';
import { webkit, chromium } from '/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)); const eng = process.argv[2] === 'chromium' ? chromium : webkit;
const R = { mex3: '/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01', olive1: '/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-48a4-4b23-b6e5-749a332afe89', under2: '/notebook/underbelly-light-base/underbelly-light-base-v2', base2: '/notebook/standard-base/standard-base-v2' };
const A = '@media (min-width: 984px) { .recipe-page { grid-template-rows: auto auto 1fr auto; } .recipe-page--no-method { grid-template-rows: auto 1fr auto; } }';
const br = await eng.launch(eng === chromium ? { channel: 'chrome' } : {}); const out = {};
const read = (p) => p.evaluate(() => { const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(2), y: +(b.y + scrollY).toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2), bottom: +(b.bottom + scrollY).toFixed(2) }; };
  const pg = document.querySelector('.recipe-page'); const reg = pg.querySelector('.ingredient-table-region'); const t = reg.querySelector('.ingredient-table'); const m = pg.querySelector('.method-region'); const side = pg.querySelector('.side-region'); const kids = [...m ? m.children : []];
  const mc = m ? Math.max(...[...m.children].map((c) => c.getBoundingClientRect().bottom + scrollY)) : null; const sidekids = [...side.children].map((c) => r(c)); const log = document.querySelector('.notebook-log');
  return { rows: getComputedStyle(pg).gridTemplateRows, page: r(pg), table: r(t), region: r(reg), method: r(m), methodContentBottom: mc, side: r(side), sideKids: sidekids, tableToMethod: m ? +(r(m).y - r(t).bottom).toFixed(2) : null, emptyUnderTable: +(r(reg).bottom - r(t).bottom).toFixed(2), emptyUnderMethod: m ? +(r(m).bottom - mc).toFixed(2) : null, leftFoot: m ? +(r(pg).bottom - mc - parseFloat(getComputedStyle(pg).paddingBottom)).toFixed(2) : null, doc: document.documentElement.scrollHeight, logY: r(log).y }; });
for (const k of ['mex3', 'olive1', 'under2', 'base2']) for (const W of [984, 1024, 1366, 1600]) for (const v of ['built', 'A', 'AB']) {
  if (v === 'AB' && !['mex3', 'olive1'].includes(k)) continue;
  const ctx = await br.newContext({ viewport: { width: W, height: 1000 }, hasTouch: eng === webkit, deviceScaleFactor: 1 }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:4173' + R[k], { waitUntil: 'networkidle' }); await p.waitForSelector('.ingredient-table'); await p.evaluate(() => document.fonts.ready);
  if (v !== 'built') await p.addStyleTag({ content: A });
  if (v === 'AB') { const b = p.locator('.margin-region button[aria-expanded="true"]').first(); if (await b.count()) await b.click(); }
  await p.waitForTimeout(150); out[`${k}_${W}_${v}`] = await read(p); await ctx.close();
}
await br.close(); await writeFile(path.join(HERE, process.argv[2] === 'chromium' ? 'empty-probe-chromium.json' : 'empty-probe.json'), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(18), 'rows', v.rows.replace(/px/g, ''), '| table->method', v.tableToMethod, 'empty under table', v.emptyUnderTable, 'left foot blank', v.leftFoot, '| side', v.side.h, 'page', v.page.h, 'doc', v.doc);
